var ShapeElement = require('happygui-shapeelement');

var CircleElement = function(options) {
  ShapeElement.call(this, options); // Super

  this.hasBorderColor = true;
  this.hasBorderThickness = true;
  this.hasBackgroundColor = true;
  this.hasRadius = true;

  this.borderColor = options.borderColor || "#cc0000";
  this.borderThickness = options.borderThickness || "5px";
  this.backgroundColor = options.backgroundColor || "#00cc00";
  this.radius = options.radius || 80;
};
CircleElement.prototype = Object.create(ShapeElement.prototype);
CircleElement.prototype.constructor = CircleElement;

module.exports = CircleElement;