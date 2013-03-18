module.exports = hg_Router;

var Router = require('apily-router');

// r is handler for routing
var r = {
  homepage: function() {
    console.log("YUHU WE ARE IN HOMEPAGE");
  },
  newpage: function() {
    console.log("YUHU WE ARE IN NEWPAGE");
  },
  editor: function() {
    console.log("YUHU WE ARE IN editor");
  },
  help: function() {
    console.log("YUHU WE ARE IN help");
  },
  collection: function() {
    console.log("YUHU WE ARE IN collection");
  },
  element_editor: function(type) {
    console.log("YUHU WE ARE IN editor:"+type);
  }
};

// router is the app route
var hg_Router = new Router()
  .route('#homepage', r.homepage)
  .route('#new', r.newpage)
  .route('#editor', r.editor)
  .route("#help", r.help)
  .route("#collection", r.collection)
  .route('#editor/:type', r.element_editor);

// starting history
hg_Router.history.start();