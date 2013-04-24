var Element = require('happygui-element');

/**
* This is a superclass of all the shape elements
*
* @class ShapeElement
* @param {Object}
*  isDeletable {Boolean} if the circle can be deleted
*  x {Integer} x position of the circle
*  y {Integer} x position of the circle
*  height {Integer} height of the circle
*  width {Integer} width of the circle
*  drawing {Raphael} Reference to the Raphael drawing object*  borderColor {Hexadecimal} Colour of the border
*  borderThickness {Integer} Thickness of border in pixels
*  backgroundColor {String} Fill colour of the circle
*/
var ShapeElement = function(options) {
  Element.call(this, options); // Super

  this.hasBorderColor = true;
  this.hasBorderThickness = true;
  this.hasBackgroundColor = true;

  this.borderColor = options.borderColor || "rgb(255,0,0)";
  this.borderThickness = options.borderThickness || 5;
  this.backgroundColor = options.backgroundColor || "rgb(0,255,0)";
};
ShapeElement.prototype = Object.create(Element.prototype);
ShapeElement.prototype.constructor = ShapeElement;

module.exports = ShapeElement;