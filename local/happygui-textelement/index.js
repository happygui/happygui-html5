var Element = require('happygui-element');

var TextElement = function(options) {
  Element.call(this, options); // Super

  this.hasFontSize = true;
  this.hasFontColor = true;

  this.fontSize = options.fontSize || "13px";
  this.fontColor = options.fontColor || "#000";
};
TextElement.prototype = Object.create(Element.prototype);
TextElement.prototype.constructor = TextElement;

module.exports = TextElement;