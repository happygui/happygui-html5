var Element = require('happygui-element');

/**
* This is a superclass of all the shape elements
*
* @class ShapeElement
* @param isDeletable {Boolean} if the circle can be deleted
* @param x {Integer} x position of the circle
* @param y {Integer} x position of the circle
* @param height {Integer} height of the circle
* @param width {Integer} width of the circle
* @param drawing {Boolean} if the circle can be drawn
* @param borderColor {Hexadecimal} Colour of the border
* @param borderThickness {Integer} Thickness of border in pixels
* @oaram backgroundColor {Hexadecimal} Fill colour of the circle
*/
var ShapeElement = function(options) {
  Element.call(this, options); // Super

  this.hasBorderColor = true;
  this.hasBorderThickness = true;
  this.hasBackgroundColor = true;

  this.borderColor = options.borderColor || "#cc0000";
  this.borderThickness = options.borderThickness || 5;
  this.backgroundColor = options.backgroundColor || "#00cc00";
};
ShapeElement.prototype = Object.create(Element.prototype);
ShapeElement.prototype.constructor = ShapeElement;

module.exports = ShapeElement;