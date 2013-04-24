/** 
* This is the superclass of all elements
*
* @class Element
* @param isDeletable {Boolean} if the circle can be deleted
* @param x {Integer} x position of the circle
* @param y {Integer} x position of the circle
* @param height {Integer} height of the circle
* @param width {Integer} width of the circle
* @param drawing {Boolean} if the circle can be drawn
*/
function Element(options) {
  options = options || {};
  this.type = options.type;
  this.isDeletable = (options.isDeletable != undefined) ? options.isDeletable : true;
  this.x = options.x !== undefined ? options.x :  240;
  this.y = options.y !== undefined ? options.y : 120;
  this.height = options.height || 60;
  this.width = options.width || 90;
  this.drawing = options.drawing || false;
}

module.exports = Element;