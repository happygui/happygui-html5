var Element = require('happygui-element');

var ShapeElement = function(options) {
  Element.call(this, options); // Super

  this.hasBorderColor = true;
  this.hasBorderThickness = true;
  this.hasBackgroundColor = true;

  this.borderColor = "#cc0000";
  this.borderThickness = "5px";
  this.backgroundColor = "#00cc00";
};
ShapeElement.prototype = Object.create(Element.prototype);
ShapeElement.prototype.constructor = ShapeElement;

module.exports = ShapeElement;