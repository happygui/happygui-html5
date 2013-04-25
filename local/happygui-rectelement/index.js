var ShapeElement = require('happygui-shapeelement');

/**
* Handles the rectangle element
*
* @class RectElement
* @param {Object}
*  drawing {Raphael} Reference to the Raphael drawing object
*  isDeletable {Boolean} if the rectangle can be deleted
*  x {Integer} x position of the rectangle
*  y {Integer} x position of the rectangle
*  height {Integer} height of the rectangle
*  width {Integer} width of the rectangle
*  borderColor {String} Colour of the border
*  borderThickness {Integer} Thickness of border in pixels
*  backgroundColor {String} Fill colour of the rectangle
*/

var RectElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

  this.hasWidth = true;
  this.hasHeight = true;
};
RectElement.prototype = Object.create(ShapeElement.prototype);
RectElement.prototype.constructor = RectElement;

/**
* Redraw the element if the attributes have been changed
*
* @method redraw
* @return {Object} Return 'this' for chaining
*/
RectElement.prototype.redraw = function(coords) {
  var toDraw = {
    stroke: this.borderColor,
    fill: this.backgroundColor,
    "stroke-width": this.borderThickness,
    width: this.width,
    height: this.height
  };
  if (coords) {
    toDraw.x = this.x;
    toDraw.y = this.y;
  }

  this.drawing.attr(toDraw)
};

/**
* Draw the element on the page
*
* @method draw
* @param draggable {Boolean} If the element can be moved around
* @param paper {} Canvas on which the element will be drawn
* @param callback {}
*/
RectElement.prototype.draw = function (draggable, paper, oncomplete, onmove) {
  var self = this;

  this.drawing = paper
    .rect(self.x, self.y, self.width, self.height)
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
      function(dx, dy, x, y) {
        self.borderThickness = parseInt(self.borderThickness);
        self.width = parseInt(self.width);
        self.height = parseInt(self.height);

        console.log(self.x + dx, self.borderThickness, 480 - (self.width + self.borderThickness));
        this.attr({
          x: Math.min(Math.max(self.x + dx, self.borderThickness), 480 - (self.width + self.borderThickness)),
          y: Math.min(Math.max(self.y + dy, self.borderThickness), 600 - (self.height + self.borderThickness))
        });
        if (onmove) onmove(this.attr("x"),this.attr("y"));
      },
      function () {
      },
      function () {
        self.x = this.attr("x");
        self.y = this.attr("y");
        oncomplete(self.x, self.y);
      }
    );

  return this.drawing;
};

module.exports = RectElement;