var ShapeElement = require('happygui-shapeelement');

var RectElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

  this.hasBorderColor = true;
  this.hasBorderThickness = true;
  this.hasBackgroundColor = true;

  this.borderColor = options.borderColor || "#cc0000";
  this.borderThickness = options.borderThickness || "5px";
  this.backgroundColor = options.backgroundColor || "#00cc00";
};
RectElement.prototype = Object.create(ShapeElement.prototype);
RectElement.prototype.constructor = RectElement;

module.exports = RectElement;