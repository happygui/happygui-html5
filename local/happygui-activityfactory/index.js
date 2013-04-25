var NullCollectionException = require('happygui-nullcollectionexception');
var NullElementException = require('happygui-nullelementexception');
var StorageCtrl = require('happygui-storagectrl');

/**
* Controls what the user can see on the page
* 
* @class ActivityFactory
* @param editorView {EditorView} The left side of the screen
* @param previewView {PreviewView} The right side of the screen
* @param pageView {PageView} The other screens that may need to be displayed
*/
var ActivityFactory = function(editorView, previewView, pageView) {
  return {
    homepage: function() { pageView.render('homepage', null) },
    newpage: function() { pageView.render('newpage', null); },
    help: function() { pageView.render('help', null); },
    collection: function() { pageView.render("collection", {collection: StorageCtrl.getCollections()}); },
    code: function(collection) {
      editorView.reset().select(collection);

      editorView.code.show().getCode(collection);

      previewView.render(collection);
    },
    editor: function(collection) {
      try { editorView.reset().select(collection).render(); }
      catch(exception) {
        // TODO this should not appear in history
        if (exception instanceof NullCollectionException) {
          this.currentCollection = null;
          window.location = "#collection";
        } else {
          console.log(exception);
        }
      }
      previewView.render(collection);
    },
    colorpicker: function(collection, type) {
      editorView.reset().select(collection);

      editorView.colorpicker.type = type;
      editorView.colorpicker.show();

      previewView.render(collection);
    },
    element_colorpicker: function(collection, type, id) {
      editorView.reset().select(collection, {id: id});

      editorView.colorpicker.type = type;
      editorView.colorpicker.show();

      previewView.render(collection);
    },
    element_editor: function(collection, type, id) {

      try {

        editorView.reset().select(collection, {type: type, id: id});

        if (id) {
          editorView.render();
        } else {
          window.location = "#editor/"+collection+"/"+type+"/"+editorView.currentElement;
          // delete history
          return this;
        }

      } catch(exception) {

        // TODO this should not appear in history
        if (exception instanceof NullCollectionException) {
          this.currentCollection = null; //TODO CHECK
          window.location = "#collection";
        } else if (exception instanceof NullElementException) {
          this.currentElement = null;
          window.location = "#editor/"+collection;
        } else {
          console.log(exception, exception.message);
        }

      }

      previewView.render(collection);

    }
  }
};

module.exports = ActivityFactory;