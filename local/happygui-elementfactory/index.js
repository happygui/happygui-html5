var TextElement = require('happygui-textelement');
var CircleElement = require('happygui-circleelement');
var RectElement = require('happygui-rectelement');
var NullElementException = require('happygui-nullelementexception')

var ElementFactory = {
  create: function (doc) {
    var element;

    switch (doc.type) {
      case "image":
        break;
      case "circle":
        element = new CircleElement(doc);
        break;
      case "rect":
        element = new RectElement(doc);
        break;
      case "text":
        element = new TextElement(doc);
        break;
      default:
        throw new NullElementException("Type not recognised");
    }

    return element;
  },
  prototype: function (type) {
    var prototype;
    switch (type) {
      case "image":
        break;
      case "circle":
        prototype = CircleElement.prototype;
        break;
      case "rect":
        prototype = RectElement.prototype;
        break;
      case "text":
        prototype = TextElement.prototype;
        break;
      default:
        throw new NullElementException("Type not recognised");
    }
    return prototype;
  },
  decorateElement: function(element) {
    try {
      element.__proto__ = ElementFactory.prototype(element.type);
    } catch (exception) {
      if (exception instanceof NullElementException) {
        // TODO
      }
      console.log(exception);
    }
    return element;
  },
  decorateCollection: function(collection) {
    collection.elements = collection.elements.map(ElementFactory.decorateElement);
    return collection;
  },
  decorateAll: function(collections) {
    collections = collections.map(ElementFactory.decorateCollection);
    return collections;
  }
};

module.exports = ElementFactory;