var View = require('happygui-view');
var Templates = require('happygui-templates');
var StorageCtrl = require('happygui-storagectrl');

function PageView (options) {
  View.call(this, options);
  options = options || {};

  this.bindAll();
  return this;
}
PageView.prototype = Object.create(View.prototype);
PageView.prototype.constructor = PageView;

PageView.prototype.clear = function() {
  this.el('');
  return this;
};

PageView.prototype.bindAll = function () {
  this.bind('click #collectionSave', StorageCtrl.createCollection);
};

PageView.prototype.render = function (template, data) {

  this
    .el(Templates.getCollections(template)(data))
    .show();

  return this;
};
module.exports = PageView;