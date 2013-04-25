var View = require('happygui-view');

/**
 * Handles the colour picker which allows the user to change colour of different aspects of the elements
 *
 * @class ColorPicker
 */
function CodeView (options) {
  View.call(this, options);
  options = options || {};
  this.hidden = true;
  this.type = null;
  return this;
}
CodeView.prototype = Object.create(View.prototype);
CodeView.prototype.constructor = CodeView;

CodeView.prototype.getCode = function(collection) {
  if (typeof jsObject !== 'undefined') {
    jsObject.getTouchDevelop(collection, 'editor.code.gotCode');
  }
  return this;
};

CodeView.prototype.gotCode = function(data) {
  console.log(data);
  document.getElementById(this.container).innerHTML = data;
};

module.exports = CodeView;