var View = require('happygui-view');
var Translator = require('touchdevelop-html');
var StorageCtrl = require('happygui-storagectrl');

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
  this.gotCode(Translator(StorageCtrl.getCollection(collection)));
  return this;
};

CodeView.prototype.gotCode = function(data) {
  console.log("got code");
  document.getElementById(this.container).innerHTML = "<a class='btn-editor green_bg go-editor'>Go back</a><div class='inner'>"+data+"</div>";
};

module.exports = CodeView;