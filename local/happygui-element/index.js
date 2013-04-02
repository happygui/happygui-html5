function Element(options) {
  options = options || {};
  this.type = options.type;
  this.isDeletable = (options.isDeletable != undefined) ? options.isDeletable : true;
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.height = options.height || 30;
  this.width = options.width || 30;
}

module.exports = Element;