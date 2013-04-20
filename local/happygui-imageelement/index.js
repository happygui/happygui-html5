var Element = require('happygui-element');

var ImageElement = function(options) {
  Element.call(this, options); // Super
  options = options || {};

  this.hasWidth = true;
  this.hasHeight = true;

  this.url = options.url;
};
ImageElement.prototype = Object.create(Element.prototype);
ImageElement.prototype.constructor = ImageElement;

ImageElement.prototype.redraw = function() {
  this.drawing.attr({
    width: this.width,
    height: this.height
  })
};

ImageElement.prototype.draw = function (paper, callback) {
  var self = this;

  this.drawing = paper
    .image(self.url, self.x, self.y, self.width, self.height)
    .drag(
    function(dx, dy, x, y) {
      self.width = parseInt(self.width);
      self.height = parseInt(self.height);

      console.log(self.x + dx, self.borderThickness, 480 - self.width);
      this.attr({
        x: Math.min(Math.max(self.x + dx, 0), 480 - self.width),
        y: Math.min(Math.max(self.y + dy, 0), 600 - self.height)
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

module.exports = ImageElement;