var Element = require('happygui-element');

var TextElement = function(options) {
  Element.call(this, options); // Super
  options = options || {};

  this.hasFontSize = true;
  this.hasFontColor = true;

  this.fontSize = options.fontSize || 25;
  this.fontColor = options.fontColor || "#000";
};
TextElement.prototype = Object.create(Element.prototype);
TextElement.prototype.constructor = TextElement;

TextElement.prototype.draw = function (paper, callback) {
  var self = this;


  this.drawing = paper
    .text(self.x, self.y, "Jeaaaaaaaaaaaaaaah")
    .attr({
      fill: self.fontColor,
      dy: 0,
      dx: 0,
      font: "italic "+self.fontSize+"px Helvetica"
    })
    .drag(
    function(dx, dy, x, y) {
      console.log(dx, dy, x, y);
      this.attr({x: self.x + dx, y: self.y + dy, dy:0, dx:0});
      console.log("one", this.attr("x")+dx, this.attr("y")+dy);
    },
    function () {
      console.log("two", this.attr("x"),this.attr("y"));
      this.attr({x: self.x, y: self.y, dy:0, dx:0});
      console.log("two", this.attr("x"),this.attr("y"));
    },
    function () {
      self.x = this.attr("x");
      self.y = this.attr("y");
      console.log("three", this.attr("x"), this.attr("y"));
      callback(self.x, self.y);
    }
  );

  return this.drawing;
};

module.exports = TextElement;