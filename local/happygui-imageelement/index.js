var Element = require('happygui-element');

/**
* Handles the image element
*
* @class ImageElement
* @param isDeletable {Boolean} if the image can be deleted
* @param x {Integer} x position of the image
* @param y {Integer} x position of the image
* @param height {Integer} height of the image
* @param width {Integer} width of the image
* @param drawing {Boolean} if the image can be drawn
*/
var ImageElement = function(options) {
  Element.call(this, options); // Super
  options = options || {};

  this.hasWidth = true;
  this.hasHeight = true;

  this.url = options.url;
};
ImageElement.prototype = Object.create(Element.prototype);
ImageElement.prototype.constructor = ImageElement;

/**
* Redraw the element if the attributes have been changed
*
* @method redraw
* @return {Object} Return 'this' for chaining
*/
ImageElement.prototype.redraw = function() {
  this.drawing.attr({
    width: this.width,
    height: this.height
  })
};

/**
* Draw the element on the page
*
* @method draw
* @param draggable {Boolean} If the element can be moved around
* @param paper {} Canvas on which the element will be drawn
* @param callback {}
*/
ImageElement.prototype.draw = function (draggable, paper, callback) {
  var self = this;

  this.drawing = paper
    .image(self.url, self.x, self.y, self.width, self.height);


  if (draggable)
    this.drawing.drag(
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