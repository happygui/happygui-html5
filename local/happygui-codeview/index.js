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
  } else {
    this.gotCode('Whooooops! <br/> \
    Code can be generated only through a device!');
  }
  return this;
};

CodeView.prototype.gotCode = function(data) {
  console.log("got code");
  document.getElementById(this.container).innerHTML = "<a class='btn-editor green_bg go-editor'>Go back</a><div class='inner'>"+data+"</div>";
};

module.exports = CodeView;