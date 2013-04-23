var delegate = require('delegate');
var Emitter = require('emitter');

/**
* This is the superclass of all the different views the user could see
*
* @class View
*/
function View (options) {
  options = options || {};

  this.container = options.container;
  this.hidden = false;
}
View.prototype = Object.create(Emitter.prototype);

/**
* Listen for an event
*
* @method broadcast
* @param emitter
* @param event
* @param method
*/
View.prototype.broadcast = function(emitter, event, method) {
};

/**
* Bind the event to the method
* 
* @method bind
* @param str {String} this is the event that needs to be bound to the method
* @param method {String} this is the method which should be called when the event occurs
*/
View.prototype.bind = function(str, method) {
  // From component/view
  var parts = str.split(' ');
  var event = parts.shift();
  var selector = parts.join(' ');
  /*    var meth = this[method];
   if (!meth) throw new TypeError('method "' + method + '" is not defined');
   */
  var meth = method;
  var fn = delegate.bind(document.getElementById(this.container), selector, event, meth.bind(this));
};

/**
* This will show the view
*
* @method show
* @return {Object} Return 'this' for chaining
*/
View.prototype.show = function() {
  if (this.hidden == true) {
    this.hidden = false;
    document.getElementById(this.container).className = "";
  }

  return this;
};

/**
* This will hide the view
*
* @method hide
* @return {Object} Return 'this' for chaining
*/
View.prototype.hide = function() {
  if (this.hidden == false) {
    this.hidden = true;
    document.getElementById(this.container).className = "hidden";
  }

  return this;
};

View.prototype.el = function(html) {
  document.getElementById(this.container).innerHTML = html;

  return this;
};

module.exports = View;