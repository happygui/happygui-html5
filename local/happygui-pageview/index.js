var View = require('happygui-view');
var Templates = require('happygui-templates');
var StorageCtrl = require('happygui-storagectrl');

/** 
* Handles all the different page views which the user could see
*
* @class PageView
* @param options {Object}
* @return {Object} Return 'this' for chaining
*/
function PageView (options) {
  View.call(this, options);
  options = options || {};

  this.bindAll();
  return this;
}
PageView.prototype = Object.create(View.prototype);
PageView.prototype.constructor = PageView;

/** 
* Clear the page
*
* @method clear
* @return {Object} Return 'this' for chaining
*/
PageView.prototype.clear = function() {
  this.el('');
  return this;
};

/** 
* Bind all the DOM events to their relative methods
*
* @method bindAll
*/
PageView.prototype.bindAll = function () {
  this.bind('click #collectionSave', StorageCtrl.createCollection);
};

/**
 * Renders the HTML for the this page 
 *
 * @method render
 * @return {Object} Return 'this' for chaining
 */
PageView.prototype.render = function (template, data) {

  this
    .el(Templates.getCollections(template)(data))
    .show();

  return this;
};
module.exports = PageView;