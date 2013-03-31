function Element(options) {
  options = options || {};
  this.type = options.type;
  this.isDeletable = options.isDeletable;
}

module.exports = Element;