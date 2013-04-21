var Emitter = require('emitter');

var ElementFactory = require('happygui-elementfactory');
var NoPlatformException = require('happygui-noplatformexception');
var NullElementException = require('happygui-nullelementexception');
var NullCollectionException = require('happygui-nullcollectionexception');
var Collection = require('happygui-collection');


Storage.prototype.setObject = function(key, value) {this.setItem(key, JSON.stringify(value));};
Storage.prototype.getObject = function(key) {var value = this.getItem(key); return value && JSON.parse(value);};


var StorageCtrl = (function(){
  var emitter = new Emitter;
  var operating_system = false;
  var win8_datastore;
  var raw;
  var filesCollection;

  var getRawData = function () {
    if (typeof Windows !== 'undefined') {
      win8_datastore = require('happygui-win8-datastore');
      operating_system = 'windows';
    } else if (typeof jsObject !== 'undefined') {
      operating_system = 'android';
      jsObject.getObject("happy", "StorageCtrl.raw");
    } else if (typeof localStorage !== 'undefined') {
      operating_system = 'web';
      emitter.emit('raw', localStorage.getObject('happygui-collection'));
    } else {
      throw new NoPlatformException('Operating system not supported');
    }
  };

  var saveInStorage = function () {
    var toSave = filesCollection.models;
    for (var i = 0; i < filesCollection.models.length; i++) {
      for (var j = 0; j < filesCollection.models[i].elements.length; j++) {
        delete toSave[i].elements[j].drawing;
      }
    }

    switch (operating_system) {
      case 'android':
        jsObject.setObject('happy', JSON.stringify(toSave), "StorageCtrl.saved");
        break;
      case 'windows':
        win8_datastore.save('file', 'happygui-collection.json', toSave);
        break;
      case 'web':
        localStorage.setObject('happygui-collection', toSave);
        break;
    }
  };

  var clearStorage = function () {
    filesCollection.models = [];
    //TODO implement better
    if (localStorage) {
      localStorage.clear();
    } else {
      throw new NoPlatformException('Cannot reset');
    }
  };

  var getCollection = function(collection) {
    if (filesCollection.models[collection] === undefined) {
      throw new NullCollectionException ("No collection found");
    }
    return filesCollection.models[collection];
  };

  var createCollection = function (obj) {
    filesCollection.models.push(obj);
    saveInStorage();
  };

  var getElement = function(element, collection) {
    var collectionModel = getCollection(collection);
    if (collectionModel.elements[element] === undefined) {
      throw new NullElementException ("No element found");
    }
    return collectionModel.elements[element];
  };

  emitter.on('raw', function(raw) {
    if (typeof raw === 'string') raw = JSON.parse(raw);
    filesCollection = new Collection(raw);
    if (raw && raw.length > 0) filesCollection.models = ElementFactory.decorateAll(raw);
  });

  getRawData();

  return {
    raw: function(raw) {
      if (!raw) jsObject.setObject('happy', JSON.stringify([]), 'StorageCtrl.created')
      emitter.emit("raw", raw);
    },
    created: function (result) { filesCollection = new Collection(); },
    saved: function(result) { console.log("saved "+result); },
    getCollection: function(collection) { return getCollection(collection); },
    getCollections: function() { return filesCollection.models; },
    createCollection: function() {
      var name = document.getElementById("collectionName").value;
      createCollection({name: name, elements: [], backgroundColor: "#fff"});
      document.getElementById("collectionName").value = '';
      window.location = "#editor/" + (filesCollection.length()-1);
      return this;
    },
    setCollectionAttribute: function(collection, key, value) {
      var current = getCollection(collection);
      if (typeof current[key] === 'undefined') return this;

      filesCollection.models[collection][key] = value;
      return this;
    },
    delCollection: function(collection) {
      filesCollection.models.splice(collection, 1);
      saveInStorage();
    },
    getElement: function(element, collection) { return getElement(element, collection); },
    getElements: function(collection) { return getCollection(collection).elements; },
    setElementAttribute: function(element, collection, key, value) {
      // Validation
      // TODO throw errors
      if (key.slice(0,3) == "has") return this;
      var current = getElement(element, collection);
      if (typeof current[key] === 'undefined') return this;

      filesCollection.models[collection].elements[element][key] = value;
      return this;
    },
    delElement: function(element, collection) {
      filesCollection.models[collection].elements.splice(element, 1);
      saveInStorage();
    },
    createElement: function (collection, doc) {
      var element = ElementFactory.create(doc);
      return filesCollection.models[collection].elements.push(element) - 1;
    },
    update: function (toSave, doc, collection, element) {
      if (doc !== undefined && collection !== undefined && element !== undefined) {
        filesCollection.models[collection].elements[element] = doc;
      } else if (doc !== undefined && collection !== undefined) {
        filesCollection.models[collection] = doc;
      } else if (doc !== undefined) {
        filesCollection.models = doc;
      }
      if (toSave) saveInStorage();
    },
    reset: function() {
      if (confirm("Your data will be lost forever, are you fine with that?")) {
        clearStorage();
      }
      return this;
    },
    operating_system: function() { return operating_system; }
  }
})();

module.exports = StorageCtrl;