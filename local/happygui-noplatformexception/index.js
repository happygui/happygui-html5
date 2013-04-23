/**
* NoPlatformException is an error which is thrown if no platform is detected
*
* @class NoPlatformException
* @param message {String} The message which will be displayed if the error is caught
*/
function NoPlatformException (message) {
  Error.call(message);
  this.message = message || "";
  this.name = "NoPlatformException";
}
NoPlatformException.prototype = Object.create(Error.prototype);
NoPlatformException.prototype.constructor = NoPlatformException;

module.exports = NoPlatformException;