/**
* NullCollectionException is an error which is thrown if no collection is found
*
* @class NullCollectionException
* @param message {String} The message which will be displayed if the error is caught
*/
function NullCollectionException (message) {
  Error.call(message);
  this.message = message || "";
  this.name = "NullCollectionException";
}
NullCollectionException.prototype = Object.create(Error.prototype);
NullCollectionException.prototype.constructor = NullCollectionException;

module.exports = NullCollectionException;