var Emitter = require('emitter');
var Streaming = require('happygui-streaming');

var ElementFactory = require('happygui-elementfactory');
var NoPlatformException = require('happygui-noplatformexception');
var NullElementException = require('happygui-nullelementexception');
var NullCollectionException = require('happygui-nullcollectionexception');
var Collection = require('happygui-collection');


Storage.prototype.setObject = function(key, value) {this.setItem(key, JSON.stringify(value));};
Storage.prototype.getObject = function(key) {var value = this.getItem(key); return value && JSON.parse(value);};

/**
* Handles all of the data handling
*
* @class StorageCtrl
*/
var StorageCtrl = (function(){
  var emitter = new Emitter;
  var operating_system = false;
  var win8_datastore;
  var raw;
  var filesCollection;

/**
* Retrieve the data stored on device by detecting the operating system
*
* @method getRawData
* @throws {NoPlatformException} If operating system is not one which is supported by the application, this error will be thrown
*/
  var getRawData = function () {
    if (typeof Windows !== 'undefined') {
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

/**
* Saves the collections into storage
*
* @method saveInStorage
*/
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

  /**
  * Empties the local storage
  *
  * @method clearStorage
  * @throws {NoPlatformException} If no local storage is detected then the storage cannot be cleared
  */
  var clearStorage = function () {
    filesCollection.models = [];
    //TODO implement better
    if (localStorage) {
      localStorage.clear();
    } else {
      throw new NoPlatformException('Cannot reset');
    }
  };

/** 
* Retrieve the collection stored
*
* @method getCollection
* @param collection ID {Integer} The ID of the required collection
* @return {Array} Returns the array of the required collection 
*/
  var getCollection = function(collection) {
    if (filesCollection.models[collection] === undefined) {
      throw new NullCollectionException ("No collection found");
    }
    return filesCollection.models[collection];
  };

/** 
* Create a new collection
*
* @method createCollection
* @param collection {} This is the information required to add a new collection to the array
*/
  var createCollection = function (obj) {
    filesCollection.models.push(obj);
    saveInStorage();
  };

/** 
* Retrieve the element required
*
* @method getElement
* @param collection ID {Integer} The ID of the required collection
*
* @return {Array} Returns the array of the required collection 
*/
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
      if (!raw && typeof jsObject !== 'undefined') jsObject.setObject('happy', JSON.stringify([]), 'StorageCtrl.created');
      emitter.emit("raw", raw);
    },
    streaming: function() {
      return Streaming;
    },
    created: function (result) { filesCollection = new Collection(); },
    saved: function(result) { console.log("saved "+result); },

    getCollection: function(collection) { return getCollection(collection); },
    getCollections: function() { return filesCollection.models; },
    createCollection: function() {
      var name = document.getElementById("collectionName").value;
      createCollection({name: name, elements: [], backgroundColor: "rgb(255,255,255)"});
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
      if (Streaming.active()) { Streaming.updateElement(element, key, value); }
      return this;
    },
    delElement: function(element, collection) {
      if (typeof jsObject !== 'undefined') {
        var el = getCollection(collection).elements[element];
        if (el.type === 'image') {
          jsObject.delImage(el.url);
        }
      }
      filesCollection.models[collection].elements.splice(element, 1);
      if (Streaming.active()) { Streaming.deleteElement(element); }
      saveInStorage();
    },
    createElement: function (collection, doc) {
      var element = ElementFactory.create(doc);
      var id = filesCollection.models[collection].elements.push(element) - 1;
      if (Streaming.active()) { Streaming.createElement(element); }
      return id;
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