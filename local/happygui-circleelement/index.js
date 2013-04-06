var ShapeElement = require('happygui-shapeelement');

var CircleElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

  this.hasRadius = true;
  this.radius = options.radius || 30;
};
CircleElement.prototype = Object.create(ShapeElement.prototype);
CircleElement.prototype.constructor = CircleElement;
CircleElement.prototype.setPos = function (x,y) {
  this.x = x;
  this.y = y;
  console.log(x,y, this.x, this.y);
};
CircleElement.prototype.draw = function (paper, callback) {

  var self = this;

  return paper
    .circle(self.radius + self.x, self.radius + self.y, self.radius)
    .attr({
      stroke: self.borderColor,
      fill: self.backgroundColor,
      "fill-opacity": .5,
      "stroke-width": self.borderThickness,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    }).drag(function (dx, dy) {
      this.attr({
        cx: Math.min(Math.max(self.x + dx, self.radius + 5), 480-(self.radius+5)),
        cy: Math.min(Math.max(self.y + dy, self.radius + 5), 800-(self.radius+5))
      });
    }, function () {
    }, function () {
      self.x = this.attr("cx");
      self.y = this.attr("cy");
      callback(self.x, self.y);
    });

};

module.exports = CircleElement;