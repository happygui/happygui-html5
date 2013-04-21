var View = require('happygui-view');

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