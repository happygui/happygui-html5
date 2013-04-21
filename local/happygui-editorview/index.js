var StorageCtrl = require('happygui-storagectrl');
var Templates = require('happygui-templates');
var View = require('happygui-view');
var ColorPicker = require('happygui-colorpicker');
var NullElementException = require('happygui-nullelementexception');
var NullCollectionException = require('happygui-nullcollectionexception')

function EditorView (options) {
  View.call(this, options);
  options = options || {};

  this.currentCollection = options.collection;
  this.currentElement = options.element || false;

  this.colorpicker = new ColorPicker({container: options.colorpicker});

  this.bindAll();

  return this;
}

EditorView.prototype = Object.create(View.prototype);
EditorView.prototype.constructor = EditorView;

EditorView.prototype.bindAll = function() {
  this.bind('click #'+this.container+' .elementNew', this.events.click_elementNew);
  this.bind('keyup #'+this.container+' input', this.events.keyup_input);
  this.bind('click #'+this.container+' .btn-delete', this.events.click_btnDelete);
  this.bind('click #'+this.container+' .go-editor', this.events.click_goEditor);
  this.bind('click #'+this.container+' .go-collection', this.events.click_goCollection);
  this.bind('click #'+this.container+' .go-cpDialog', this.events.click_goCpDialog);
  this.colorpicker.bind('click #'+this.colorpicker.container+' .colorpicker', this.events.click_dialogColorpicker.bind(this));
};

EditorView.prototype.events = {
  click_elementNew: function (e) {
    var type = e.target.id.replace('New','');
    try {
      var id = StorageCtrl.createElement(this.currentCollection, {type: type});
    } catch(exception) {
      if (exception instanceof NullElementException) {
        alert("You selected an element that doesn't exist");
        window.location = "#editor/"+this.currentCollection;
      } else {
        console.log(exception);
      }
    }
    window.location = "#editor/"+this.currentCollection+"/"+type+"/"+id;
  },
  keyup_input: function (e) {
    var key = e.target.name.replace("sm_", "");
    var value = e.target.value;
    this.setAttribute(key, value);
  },
  click_btnDelete: function (e) {
    if (this.currentElement) {
      StorageCtrl.delElement(this.currentElement, this.currentCollection);
      window.location = "#editor/"+this.currentCollection;
    } else {
      StorageCtrl.delCollection(this.currentCollection);
      window.location = "#collection";
    }
  },
  click_goEditor: function (e) {
    window.location = "#editor/"+this.currentCollection;
  },
  click_goCollection: function (e) {
    window.location = "#collection";
  },
  click_goCpDialog: function (e) {
    var type = e.target.id.replace('cp_','');
    var element = this.currentElement === null ? "" : "/"+this.currentElement;
    window.location = "#colorpicker/"+this.currentCollection+"/"+type+element;
  },
  click_dialogColorpicker: function (e) {
    var color = window.getComputedStyle(e.target).getPropertyValue('background-color');
    var url;
    try {
      this.setAttribute(this.colorpicker.type, color);
      var type = this.element().type;
      url = '#editor/'+this.currentCollection+'/'+type+'/'+this.currentElement;
    } catch (exception) {
      if (exception instanceof NullElementException) {
        url = '#editor/'+this.currentCollection;
        StorageCtrl.setCollectionAttribute(this.currentCollection, this.colorpicker.type, color);
      } else {
        console.log(exception);
      }
    } finally {
      this.hide();
      window.location = url;
    }
  }
};

EditorView.prototype.collection = function () {
  return StorageCtrl.getCollection(this.currentCollection);
};
EditorView.prototype.elements = function (element) {
  if (element === null) {
    return StorageCtrl.getElements(this.currentCollection);
  }

  return StorageCtrl.getElement(element, this.currentCollection);
};
EditorView.prototype.element = function (element) {
  return this.elements(element || this.currentElement);
};

EditorView.prototype.setCollection = function (collection) {
  collection = parseInt(collection);
  if (isNaN(collection)) throw new NullCollectionException ("Collection id must be a number");
  this.currentCollection = collection; // TODO try&catch errors

  return this;
};

EditorView.prototype.setAttribute = function (key, value) {
  StorageCtrl.setElementAttribute(this.currentElement, this.currentCollection, key, value);
  var attr;
  this.element().redraw();
};

EditorView.prototype.setElement = function (type, id) {
  this.currentElement = id || StorageCtrl.createElement(this.currentCollection, {type: type});
  return this;
};

EditorView.prototype.saveElement = function (toSave, doc) {
  StorageCtrl.update(toSave, doc, this.currentCollection, this.currentElement);
};

EditorView.prototype.select = function(collection, element) {


  this.setCollection(collection);

  if (element !== undefined ) {
    this.setElement(element.type, element.id);
  }

  return this;
};

EditorView.prototype.reset = function () {
  this.currentCollection = null;
  this.currentElement = null;
  return this;
};

EditorView.prototype.render = function () {
  var html, data;

  if (this.currentElement !== null) {
    data = this.elements(this.currentElement);
    html = Templates.getCollections("element_editor")(data);
  } else {
    data = this.collection();
    html = Templates.getCollections("editor")(data);
  }

  this.el(html).show();

  return this;
};

module.exports = EditorView;