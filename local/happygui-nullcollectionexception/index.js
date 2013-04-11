function NullCollectionException (message) {
  Error.call(message);
  this.message = message || "";
  this.name = "NullCollectionException";
}
NullCollectionException.prototype = Object.create(Error.prototype);
NullCollectionException.prototype.constructor = NullCollectionException;

module.exports = NullCollectionException;