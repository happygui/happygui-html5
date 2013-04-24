var ShapeElement = require('happygui-shapeelement');

/**
* Handles the circle element
*
* @class CircleElement
* @param isDeletable {Boolean} if the circle can be deleted
* @param x {Integer} x position of the circle
* @param y {Integer} x position of the circle
* @param height {Integer} height of the circle
* @param width {Integer} width of the circle
* @param drawing {Boolean} if the circle can be drawn
* @param borderColor {Hexadecimal} Colour of the border
* @param borderThickness {Integer} Thickness of border in pixels
* @oaram backgroundColor {Hexadecimal} Fill colour of the circle
* @param radius {Integer} The radius of the circle
*/
var CircleElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

  this.hasRadius = true;
  this.r = options.r || 60;
};
CircleElement.prototype = Object.create(ShapeElement.prototype);
CircleElement.prototype.constructor = CircleElement;

/**
* Set the position of the circle
*
* @method setPos
* @param x {Integer} Set the x position of the circle
* @param y {Integer} Set the y position of the circle
*/
CircleElement.prototype.setPos = function (x,y) {
  this.x = x;
  this.y = y;
  console.log(x,y, this.x, this.y);
};

/**
* Redraw the circle if the attributes have been changed
*
* @method redraw
* @return {Object} Return 'this' for chaining
*/
CircleElement.prototype.redraw = function () {
  this.drawing.attr({
    stroke: this.borderColor,
    fill: this.backgroundColor,
    "stroke-width": this.borderThickness,
    r: this.r
  });

  return this;
};

/**
* Draw the element on the page
*
* @method draw
* @param draggable {Boolean} If the element can be moved around
* @param paper {} Canvas on which the element will be drawn
* @param callback {}
*/
CircleElement.prototype.draw = function (draggable, paper, callback) {

  var self = this;

  this.drawing = paper
    .circle(self.x, self.y, self.r)
    .attr({
      stroke: self.borderColor,
      fill: self.backgroundColor,
      "fill-opacity": .8,
      "stroke-width": self.borderThickness,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    });

  if (draggable)
    this.drawing.drag(
      function (dx, dy) {
        self.borderThickness = parseInt(self.borderThickness);
        self.r = parseInt(self.r);
        this.attr({
          cx: Math.min(Math.max(self.x + dx, self.r + self.borderThickness), 480-(self.r + self.borderThickness)),
          cy: Math.min(Math.max(self.y + dy, self.r + self.borderThickness), 600-(self.r + self.borderThickness))
        });
      },
      function () {
      },
      function () {
        self.x = this.attr("cx");
        self.y = this.attr("cy");
        callback(self.x, self.y);
      }
    );

  return this.drawing;
};

module.exports = CircleElement;