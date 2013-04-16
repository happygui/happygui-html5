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
  }
};

module.exports = ElementFactory;