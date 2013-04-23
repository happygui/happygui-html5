var View = require('happygui-view');

/** 
* Handles the colour picker which allows the user to change colour of different aspects of the elements
*
* @class ColorPicker
*/
function ColorPicker (options) {
  View.call(this, options);
  options = options || {};
  this.hidden = true;
  this.type = null;
  return this;
}
ColorPicker.prototype = Object.create(View.prototype);
ColorPicker.prototype.constructor = ColorPicker;

module.exports = ColorPicker;