var Element = require('happygui-element');

/**
* Handles the text element element
*
* @class TextElement
* @param isDeletable {Boolean} if the text can be deleted
* @param x {Integer} x position of the text
* @param y {Integer} x position of the text
* @param height {Integer} height of the text
* @param width {Integer} width of the text
* @param drawing {Boolean} if the text can be drawn
* @param fontSize {Integer} Size of the font of the text
* @param fontColor {Hexadecimal} Color of the font 
*/
var TextElement = function(options) {
  Element.call(this, options); // Super
  options = options || {};

  this.hasFontSize = true;
  this.hasFontColor = true;

  this.fontSize = options.fontSize || 25;
  this.fontColor = options.fontColor || "rgb(0,0,0)";
  this.y = 200;
};
TextElement.prototype = Object.create(Element.prototype);
TextElement.prototype.constructor = TextElement;

/**
* Redraw the element if the attributes have been changed
*
* @method redraw
* @return {Object} Return 'this' for chaining
*/
TextElement.prototype.redraw = function () {
  this.drawing.attr({
    fill: this.fontColor,
    font: "italic "+this.fontSize+"px Helvetica"
  });
};

/**
* Draw the element on the page
*
* @method draw
* @param draggable {Boolean} If the element can be moved around
* @param paper {} Canvas on which the element will be drawn
* @param callback {}
*/
TextElement.prototype.draw = function (draggable, paper, callback) {
  var self = this;


  this.drawing = paper
    .text(self.x, self.y, "Jeaaaaaaaaaaaaaaah")
    .attr({
      fill: self.fontColor,
      //font: "italic "+self.fontSize+"px Helvetica"
      "font-size": self.fontSize+"px"
    });

  console.log(this.drawing.getBBox(true));
  console.log(this.drawing.getBBox(false));
  var bb = this.drawing._getBBox(),
    dif = self.y - (bb.y + bb.height / 2);

    dif && this.drawing.node.firstChild.setAttribute("dy", String(dif));
    console.log(dif, "leaderrrr", bb);

  if (draggable)
    this.drawing
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