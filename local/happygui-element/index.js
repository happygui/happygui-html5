function Element(options) {
  options = options || {};
  this.type = options.type;
  this.isDeletable = (options.isDeletable != undefined) ? options.isDeletable : true;
}

module.exports = Element;