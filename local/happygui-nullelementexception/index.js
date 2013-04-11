function NullElementException (message) {
  Error.call(message);
  this.message = message || "";
  this.name = "NullElementException";
}
NullElementException.prototype = Object.create(Error.prototype);
NullElementException.prototype.constructor = NullElementException;

module.exports = NullElementException;