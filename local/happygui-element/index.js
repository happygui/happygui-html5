/** 
* This is the superclass of all elements
*
* @class Element
* @param {Object} options
*  isDeletable {Boolean} if the circle can be deleted
*  x {Integer} x position of the circle
*  y {Integer} x position of the circle
*  height {Integer} height of the circle
*  width {Integer} width of the circle
*  drawing {Raphael} Reference to the Raphael drawing object

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