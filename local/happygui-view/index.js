var delegate = require('delegate');

function View (options) {
  options = options || {};

  this.defaultContainer = "example";
  this.container = options.container;
  this.hidden = false;
}
View.prototype = Object.create(Emitter.prototype);

View.prototype.broadcast = function(emitter, event, method) {
};

View.prototype.bind = function(str, method) {
  // From component/view
  var parts = str.split(' ');
  var event = parts.shift();
  var selector = parts.join(' ');
  /*    var meth = this[method];
   if (!meth) throw new TypeError('method "' + method + '" is not defined');
   */
  var meth = method;
  var fn = delegate.bind(document.getElementById(this.container || this.defaultContainer), selector, event, meth.bind(this));
};

View.prototype.show = function() {
  if (this.hidden == true) {
    this.hidden = false;
    document.getElementById(this.container || this.defaultContainer).className = "";
  }

  return this;
};

View.prototype.hide = function() {
  if (this.hidden == false) {
    this.hidden = true;
    document.getElementById(this.container || this.defaultContainer).className = "hidden";
  }

  return this;
};

View.prototype.el = function(html) {
  document.getElementById(this.container || this.defaultContainer).innerHTML = html;

  return this;
};

module.exports = View;