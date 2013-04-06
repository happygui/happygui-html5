function Element(options) {
  options = options || {};
  this.type = options.type;
  this.isDeletable = (options.isDeletable != undefined) ? options.isDeletable : true;
  this.x = options.x !== undefined ? options.x :  240;
  this.y = options.y !== undefined ? options.y : 120;
  this.height = options.height || 60;
  this.width = options.width || 90;
}

module.exports = Element;