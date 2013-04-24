var View = require('happygui-view');
var StorageCtrl = require('happygui-storagectrl');
var Raphael = require('raphael');

/**
* This handles the left side of the page which displays the elements
*
* @class PreviewView
*/
function PreviewView (options) {
  View.call(this, options);
  options = options || {};

  this.paper = Raphael(document.getElementById(options.container), 480, 600);

  return this;
}
PreviewView.prototype = Object.create(View.prototype);
PreviewView.prototype.constructor = PreviewView;

/**
 * Renders the HTML for the preview 
 *
 * @method render
 * @param currentCollection {Integer} this is the ID of the collection which should be displayed in the preview
 * @return {Object} Return 'this' for chaining
 */
PreviewView.prototype.render = function (currentCollection) {
  var html = "", element, i = 0;
  var collection = StorageCtrl.getCollection(currentCollection);

  document.getElementById(this.container).style.backgroundColor = collection.backgroundColor;
  var self = this;

  if (collection.elements.length > 0)
    collection.elements.forEach(function(element, currentElement) {

      element.draw(true, self.paper, function() {
        StorageCtrl.update(false, element, currentCollection, currentElement);
        window.location = "#editor/"+currentCollection+"/"+element.type+"/"+currentElement;
      });
    });

  this.show();

  return this;
};

module.exports = PreviewView;