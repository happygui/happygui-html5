var ShapeElement = require('happygui-shapeelement');

var RectElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

};
RectElement.prototype = Object.create(ShapeElement.prototype);
RectElement.prototype.constructor = RectElement;

RectElement.prototype.redraw = function() {
  this.drawing.attr({
    stroke: this.borderColor,
    fill: this.backgroundColor,
    "stroke-width": this.borderThickness
  });
};

RectElement.prototype.draw = function (paper, callback) {
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
    })
    .drag(
      function(dx, dy, x, y) {
        this.attr({
          x: Math.min(Math.max(self.x + dx, self.borderThickness), 480 - (self.width + self.borderThickness)),
          y: Math.min(Math.max(self.y + dy, self.borderThickness), 600 - (self.height + self.borderThickness))
        });
      },
      function () {
      },
      function () {
        self.x = this.attr("x");
        self.y = this.attr("y");
        callback(self.x, self.y);
      }
    );

  return this.drawing;
};

module.exports = RectElement;