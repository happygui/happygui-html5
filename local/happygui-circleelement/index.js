var ShapeElement = require('happygui-shapeelement');

var CircleElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

  this.hasRadius = true;
  this.radius = options.radius || 60;
};
CircleElement.prototype = Object.create(ShapeElement.prototype);
CircleElement.prototype.constructor = CircleElement;
CircleElement.prototype.setPos = function (x,y) {
  this.x = x;
  this.y = y;
  console.log(x,y, this.x, this.y);
};
CircleElement.prototype.redraw = function () {
  this.drawing.attr({
    stroke: this.borderColor,
    fill: this.backgroundColor,
    "stroke-width": this.borderThickness
  });

  return this;
};
CircleElement.prototype.draw = function (paper, callback) {

  var self = this;

  this.drawing = paper
    .circle(self.x, self.y, self.radius)
    .attr({
      stroke: self.borderColor,
      fill: self.backgroundColor,
      "fill-opacity": .8,
      "stroke-width": self.borderThickness,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    })
    .drag(
      function (dx, dy) {
        self.borderThickness = parseInt(self.borderThickness);
        self.radius = parseInt(self.radius);
        this.attr({
          cx: Math.min(Math.max(self.x + dx, self.radius + self.borderThickness), 480-(self.radius + self.borderThickness)),
          cy: Math.min(Math.max(self.y + dy, self.radius + self.borderThickness), 600-(self.radius + self.borderThickness))
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