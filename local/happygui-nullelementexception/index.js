/**
* NullElementException is an error which is thrown if no element is found
*
* @class NullElementException
* @param message {String} The message which will be displayed if the error is caught
*/
function NullElementException (message) {
  Error.call(message);
  this.message = message || "";
  this.name = "NullElementException";
}
NullElementException.prototype = Object.create(Error.prototype);
NullElementException.prototype.constructor = NullElementException;

module.exports = NullElementException;