function NoPlatformException (message) {
  Error.call(message);
  this.message = message || "";
  this.name = "NoPlatformException";
}
NoPlatformException.prototype = Object.create(Error.prototype);
NoPlatformException.prototype.constructor = NoPlatformException;

module.exports = NoPlatformException;