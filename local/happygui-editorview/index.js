var StorageCtrl = require('happygui-storagectrl');
var Templates = require('happygui-templates');
var View = require('happygui-view');
var ColorPicker = require('happygui-colorpicker');
var NullElementException = require('happygui-nullelementexception');
var NullCollectionException = require('happygui-nullcollectionexception');

/**
 * It handles the left side of the paga aka editor
 *
 * @class EditorView
 */
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

/**
 * Binds DOM events to this.events functions
 *
 * @method bindAll
 * @return {Object} Return "this" for chaining
 */
EditorView.prototype.bindAll = function() {
  this.bind('click #'+this.container+' .elementNew', this.events.click_elementNew);
  this.bind('keyup #'+this.container+' input', this.events.keyup_input);
  this.bind('click #'+this.container+' .btn-delete', this.events.click_btnDelete);
  this.bind('click #'+this.container+' .go-editor', this.events.click_goEditor);
  this.bind('click #'+this.container+' .go-collection', this.events.click_goCollection);
  this.bind('click #'+this.container+' .go-cpDialog', this.events.click_goCpDialog);
  this.colorpicker.bind('click #'+this.colorpicker.container+' .colorpicker', this.events.click_dialogColorpicker.bind(this));
  this.bind('click #'+this.container+' .sm_plus', this.events.click_smPlus);
  this.bind('click #'+this.container+' .sm_minus', this.events.click_smMinus);
  return this;
};

/**
 * Events that bindAll will bind
 *
 * @property events
 * @type {Object}
 */
EditorView.prototype.events = {
  click_elementNew: function (e) {
    var type = e.target.id.replace('New','');
    try {
      if (typeof jsObject !== 'undefined' && type === 'image') {
        jsObject.getGalleryImage('editor.gotPhoto');

      } else if (typeof jsObject !== 'undefined' && type === 'camera') {
        jsObject.getPhoto('editor.gotPhoto');
      } else {
        var id = StorageCtrl.createElement(this.currentCollection, {type: type});
      }
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
  },
  click_smPlus: function (e) {
    var key = e.target.parentNode.parentNode.className.replace("sizemodifier sm_", '');
    var element = this.element();
    var value = parseInt(element[key]) + 3;
    this.setAttribute(key, value);
  },
  click_smMinus: function (e) {
    var key = e.target.parentNode.parentNode.className.replace("sizemodifier sm_", '');
    var element = this.element();
    var value = parseInt(element[key]) - 3;
    if (value <= 0) 
      {
        if (key === "borderThickness")
        {
          value = 0;
        }
        else
        {
        value = 1;
        }
      }
    this.setAttribute(key, value);
  }
};

/**
 * The current collection is returned in an array
 *
 * @method collection
 * @return {Array} Returns the current collection
 */
EditorView.prototype.collection = function () {
  return StorageCtrl.getCollection(this.currentCollection);
};
/**
 * Retrieves the elements or a precise one in the current
 * collection
 *
 * @method elements
 * @params {Integer} optional
 * @return {Array} Returns the current collection
 */
EditorView.prototype.elements = function (element) {
  if (element === null) {
    return StorageCtrl.getElements(this.currentCollection);
  }

  return StorageCtrl.getElement(element, this.currentCollection);
};

/**
 * Retrieves the current element or a given element
 * in the collection
 *
 * @method element
 * @params {Integer} optional
 * @return {Array} Returns the current collection
 */
EditorView.prototype.element = function (element) {
  return this.elements(element || this.currentElement);
};

/**
 * Sets the current collection
 *
 * @method setCollection
 * @params {Integer} Id of the collection
 * @return {Object} Return "this" for chaining
 */
EditorView.prototype.setCollection = function (collection) {
  collection = parseInt(collection);
  if (isNaN(collection)) throw new NullCollectionException ("Collection id must be a number");
  this.currentCollection = collection; // TODO try&catch errors

  return this;
};

/**
 * Sets the current element in the currentCollection
 * if it doesnt exists it creates a new one of the same "type"
 *
 * @method setElement
 * @params {String} Type of the element
 * @params {Integer} Id of the element (optional)
 * @return {Object} Return "this" for chaining
 */
EditorView.prototype.setElement = function (type, id) {
  this.currentElement = id || StorageCtrl.createElement(this.currentCollection, {type: type});
  return this;
};

/**
 * Saves the current element. If toSave is speciefied,
 * it will be saved in the localStorage/jsObject
 *
 * @method saveElement
 * @params {Boolean} [toSave=false] will not save in database
 * @params {Element} object to be saved
 * @return {Object} Return "this" for chaining
 */
EditorView.prototype.saveElement = function (toSave, doc) {
  StorageCtrl.update(toSave, doc, this.currentCollection, this.currentElement);
  return this;
};



/**
 * Sets the collection or the current element (if given)
 * as current
 *
 * @method select
 * @params {Integer} id of collection
 * @params {Integer} id of element (optional)
 * @return {Object} Return "this" for chaining
 */

EditorView.prototype.select = function(collection, element) {
  this.setCollection(collection);
  if (element !== undefined ) this.setElement(element.type, element.id);

  return this;
};

/**
 * Set an attribute to the current element in the current collection
 * and redraw the object on the canvas
 *
 * @method setAttribute
 * @params {String} Key of the attribute
 * @params {String} Value of the attribute
 * @return {Object} Return "this" for chaining
 */
EditorView.prototype.setAttribute = function (key, value) {
  StorageCtrl.setElementAttribute(this.currentElement, this.currentCollection, key, value);
  var attr;
  this.element().redraw();
};

/**
 * Current Collection and current element are set to null
 *
 * @method reset
 * @return {Object} Return "this" for chaining
 */
EditorView.prototype.reset = function () {
  this.currentCollection = null;
  this.currentElement = null;
  return this;
};

/**
 * Renders the HTML for the editor into this.container
 *
 * @method render
 * @return {Object} Return "this" for chaining
 */
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

/**
 * This is triggered when a photo is take by a device,
 * a new element is then created.
 *
 * @method gotPhoto
 * @params {String} url of image
 * @return {Object} Return "this" for chaining
 */
EditorView.prototype.gotPhoto = function(url) {
  if (!url) {
    window.location = "#editor/"+this.currentCollection;
  }
  var id = StorageCtrl.createElement(this.currentCollection, {type: "image", url: url});
  window.location = "#editor/"+this.currentCollection+"/image/"+id;
};

module.exports = EditorView;