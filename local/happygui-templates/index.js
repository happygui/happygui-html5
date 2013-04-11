var Templates = (function (){
  var templates = {};
  var allScripts = document.getElementsByTagName('script');

  function compile (doc) {
    return Handlebars.compile(doc.innerHTML);
  }

  for (var i=0; i<allScripts.length; i++) {
    if (allScripts[i].getAttribute('type') === 'text/html') {
      templates[allScripts[i].getAttribute('id').replace("_tpl",'')] = compile(allScripts[i]);
    }
  }

  return {
    getCollections: function (template) {
      return templates[template];
    }
  };
})();

module.exports = Templates;