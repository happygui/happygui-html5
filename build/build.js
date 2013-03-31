

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("apily-emitter/index.js", function(exports, require, module){
/**
 * Emitter
 * Event emitter component
 * 
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */

/**
 * Expose `Emitter`
 */
 
module.exports = Emitter;

/**
 * Utilities
 */

var array = [];
var slice = array.slice;

/**
 * @constructor Emitter
 */

function Emitter () {
  this._listeners = {};
}

/**
 * @method on
 * @description 
 *   Listen on the given `event` with `fn`.
 * 
 * @param {String} event event
 * @param {Function} callback callback
 * @param {Object} context context
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.on = function (event, callback, context) {
  var listeners 
    = this._listeners[event] 
    = this._listeners[event] || [];
   
  listeners.push({
    callback: callback,
    context: context
  });
  return this;
};

/**
 * @method off
 * @description
 *   Remove the given callback for `event` 
 *   or all registered callbacks.
 *
 * @param {String} event event
 * @param {Function} callback callback to remove
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.off = function (event, callback) {
  var listeners = this._listeners[event];
  var listener;
  var len;
  var i;
  
  if (!listener) {
   return this;
  }
  if (1 == arguments.length) {
    delete this._listeners[event];
    return this;
  }
  len = listeners.length;
  for (i = 0; i < len; i += 1) {
    listener = listeners[i];
    if (listener.callback === callback) {
      listeners.splice(i, 1);
      return this;
    }
  }

  return this;
};

/**
 * @method emit
 * @description
 *   Emit `event` with the given args.
 *
 * @param {String} event event
 * @param {Mixed} ...
 * @return {Emitter} this for chaining
 */

Emitter.prototype.emit = function (event) {
  var listeners = this._listeners[event];
  var listener;
  var len;
  var i;
  var args;

  if (!listeners) {
   return this;
  }
  args = slice.call(arguments, 1);
  len = listeners.length;
  for (i = 0; i < len; i += 1) {
    listener = listeners[i];
    listener.callback.apply(listener.context, args);
  }

  return this;
};

/**
 * @method listening
 * @description
 *   Check if this emitter has `event` handlers.
 * @param {String} event event
 * @return {Boolean} 
 *   `true` if this emitter has `event` handlers,
 *   `false` otherwise
 * @api public
 */

Emitter.prototype.listening = function (event) {
  var listeners = this._listeners[event];
  return !!(listeners && listeners.length);
};

/**
 * @method listen
 * @description
 *   Listen onother event emitter
 * @param {Emitter} emitter emitter to listen to
 * @param {Event} event event to listen to
 * @param {Function} callback callback
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.listen = function (emitter, event, callback) {
  emitter.on(event, callback, this);
  return this;
};

/**
 * @method unlisten
 * @description
 *   Unlisten onother event emitter
 * @param {Emitter} emitter emitter to listen to
 * @param {Event} event event to listen to
 * @param {Function} cb callback
 * @return {Emitter} this for chaining
 * @api public
 */

Emitter.prototype.unlisten = function (emitter, event, callback) {
  emitter.off(event, callback);
  return this;
};

});
require.register("apily-router/index.js", function(exports, require, module){
/*
 * router
 * Router component
 *
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */ 

/*
 * Expose `Router`
 */

module.exports = Router;

/*
 * Module dependencies
 */

var Emitter = require('emitter');
var history = require('history');

/**
 * Variables
 * Cached regular expressions for matching 
 * named param parts and splatted parts of route strings.
 */

var named_param = /:\w+/g;
var splat_param = /\*\w+/g;
var escape_regexp = /[-[\]{}()+?.,\\^$|#\s]/g;

/*
 * Router
 * Create a router.
 *
 * @api public
 */

function Router() {
  if (!(this instanceof Router)) {
    return new Router();
  }
  Emitter.call(this);
  this.history = history();
}

/*
 * Inherit from `Emitter`
 */

Router.prototype = Object.create(Emitter.prototype);
Router.prototype.constructor = Router;

/**
 *  route
 *  add a route
 * 
 * @param {String} route route name
 * @param {Function} callback callback
 * @return {Route} this for chaining
 * @api public
 */

Router.prototype.route = function (route, callback) {
  var self = this;
  var history = this.history;
  var regexp = this.route_to_regexp(route);
  
  function onroute (fragment) {
    var params = self.extract_params(regexp, fragment);
    callback.apply(self, params);
  }
  
  history.route(regexp, onroute);
  return this;
};

/**
 * route_to_regexp
 * Convert a route string into a regular expression, 
 * suitable for matching against the current location hash.
 * 
 * @param {String} route route
 * @return {RegExp} regexp of the route
 * @api pubblic
 */

Router.prototype.route_to_regexp = function (route) {
  var route = route
    .replace(escape_regexp, '\\$&')
    .replace(named_param, '([^\/]+)')
    .replace(splat_param, '(.*?)');
  var regexp = new RegExp('^' + route + '$');
  return regexp;
};

/**
 * extract_params
 * Given a regexp, and a URL fragment that it matches,
 * return the array of extracted parameters.
 *
 * @param {String} regexp route regexp
 * @param {String} fragment fragment
 * @return {Array} extracted parameters
 * @api public
 */

Router.prototype.extract_params = function (regexp, fragment) {
  return regexp.exec(fragment).slice(1);
};

});
require.register("apily-history/index.js", function(exports, require, module){
/**
 * history
 * History component
 *
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */ 

/**
 * Expose `History` singleton
 */

module.exports = history;

/**
 * Module dependencies
 */

var Emitter = require('emitter');

/**
 * singleton
 */

var singleton;

/**
 * history
 * Get the singleton
 */

function history () {
  if (!singleton) {
    singleton = new History();
  }
  return singleton;
}

/**
 * History
 * Create an history.
 *
 * @constructor
 */

function History() {
  if (!(this instanceof History)) {
    return new History();
  }
  Emitter.call(this);
  this.handlers = [];
  this.onchange = this.onchange.bind(this);
  this.started = false;
}

/**
 * Inherit from `Emitter`
 */

History.prototype = Object.create(Emitter.prototype);
History.prototype.constructor = History;

/**
 * route
 * Add a route to be tested when the hash changes. 
 * 
 * @param {String|RegExp} route route
 * @param {Function} callback callback
 * @return {History} this for chaining
 * @api public
 */

History.prototype.route = function (route, callback) {
  route = new RegExp(route);
  this.handlers.push({route: route, callback: callback});
};

/** 
 * bind
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.bind = function (route, handler, context) {
  if (typeof route === 'object') {
    return this.bind_all(route);
  }
  route = new RegExp(route);
  this.handlers.push({route: route, handler: handler, context: context});
  return this;
};

/** 
 * bind_all
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.bind_all = function (routes) {
  Object.keys(routes).forEach(function (route) {
    this.bind(route, routes[route]);
  }, this);
  return this;
};

/**
 * onchange
 * Load the url, if it's changed.
 * It's called by the browser.
 *
 * @param {Event} event event
 * @api private
 */

History.prototype.onchange = function (event) {
  var hash = '#';
  var new_hash = hash + event.newURL.split(hash)[1];
  var old_hash = hash + event.oldURL.split(hash)[1];
  var handlers = this.handlers;
  var n = handlers.length - 1;
  var i;
  var handler;
  var route;
  var callback;
  
  for (i = n; i >= 0; i -= 1) {
    handler = handlers[i];
    route = handler.route;
    callback = handler.callback;
    
    if (route.test(new_hash)) {
      callback(new_hash, old_hash);
      this.emit('change', new_hash, old_hash);
      return true;
    }
  }

  return false;
};

/**
 * start
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.start = function () {
  if (this.started) return;
  window.addEventListener('hashchange', this.onchange);
  this.started = true;
};

/**
 * stop
 * 
 * @return {History} this for chaining
 * @api public
 */

History.prototype.stop = function () {
  window.removeEventListener('hashchange', this.onchange);
  this.started = false;
};

});
require.register("apily-guid/index.js", function(exports, require, module){

/**
 * guid
 * Simple prefixed unique id generator
 * 
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */

/**
 * Expose `guid`
 */

module.exports = guid;

/**
 * id
 */

var id = 0;

/**
 * guid
 *
 * @param {String} prefix prefix
 * @return {String} prefixed unique id
 * @api public
 */

function guid (prefix) {
  prefix = prefix || '';
  id += 1;
  return prefix + id;
};

});
require.register("apily-selectors-map/index.js", function(exports, require, module){
/**
 * selectors-map
 * Element selector manager
 *
 * Copyright 2013 Enrico Marino and Federico Spini
 * MIT License
 */ 

/**
 * Expose `selectors_map`
 */

module.exports = selectors_map;

/**
 * @function selector_map
 * @descriptiorn
 *    create an object of query selected elements
 *
 * @example
 *   //<div id="container">
 *   //  <h1>hello</h1>
 *   //  <div id="text">bla bla bla</div>
 *   // </div>
 *   var el = document.getElementById(container);
 *   var selectors = {
 *     "title": "h1" 
 *     "text": "#text"
 *   };
 *   var map = selectors_map(el, selectors);
 *   // {
 *   //   "title": <h1>hello</h1>, 
 *   //   "text": <div id="text">bla bla bla</div>
 *   // } 
 * 
 * @param {Element} el element
 * @param {Object} selectors selectors
 * @param {Object} [result] selectors map
 * @return {Object} the selectors map
 */

function selectors_map (el, selectors, result) {
  var result = result || {};
  var selector;
  var name;

  for (name in selectors) {
    selector = selectors[name];
    result[name] = el.querySelector(selector);
  }

  return result;
}

});
require.register("component-matches-selector/index.js", function(exports, require, module){

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}
});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var matches = require('matches-selector')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("apily-delegate-manager/index.js", function(exports, require, module){
/*
 * delegate-manager
 * Delegate manager
 *
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */ 

/*
 * Expose `Manager`
 */

module.exports = DelegateManager;

/* 
 * Module dependencies
 */

var delegate = require('delegate');

/* 
 * Utilities
 */

var object = {};
var toString = object.toString;

/*
 * DelegateManager
 * Create an event manager.
 *
 * @param {Element} `target` object which events will be bound to
 * @param {Object} `obj` which will receive method calls
 * @return {Manager} the event manager
 */

function DelegateManager(target, obj) {
  if (!(this instanceof DelegateManager)) {
    return new DelegateManager(target, obj);
  }

  this.target = target;
  this.obj = obj;
  this._bindings = {};
}

/**
 * bind
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * @example
 *    events.bind('login') // implies "onlogin"
 *    events.bind('login', 'onLogin')
 *
 * @param {String} event `event` name
 * @param {String} [method] `method` name
 * @return {DelegateManager} the event manager, for chaining
 * @api public
 */

DelegateManager.prototype.bind = function(str, method) {
  if (toString.call(str) === '[object Object]') {
    return this.bind_all(str);
  }
  
  var target = this.target;
  var obj = this.obj;
  var bindings = this._bindings;
  var event = parse(str);
  var name = event.name;
  var selector = event.selector;
  var method = method || 'on' + name;
  var fn = obj[method].bind(obj);
  var callback;

  if (selector !== '') {
    callback = delegate.bind(target, selector, name, fn, false); 
  } else {
    target.addEventListener(name, fn, false);
    callback = fn;
  }

  bindings[name] = bindings[name] || {};
  bindings[name][method] = callback;

  return this;
};

/**
 * bind_all
 * Bind to `event` with optional `method` name
 * for each pair `event`/`method` in `obj`
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * @example
 *    events.bind('login') // implies "onlogin"
 *    events.bind('login', 'onLogin')
 *
 * @param {Object} obj pairs `event`/`method` to bind
 * @return {DelegateManager} the event manager, for chaining
 * @api public
 */

DelegateManager.prototype.bind_all = function(obj) {
  var event;
  for (event in obj) {
    this.bind(event, obj[event]);
  }
  return this;
};

/**
 * unbind
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * @example
 *     events.unbind('login', 'onLogin')
 *     events.unbind('login')
 *     events.unbind()
 *
 * @param {String} [event]
 * @param {String} [method]
 * @return {DelegateManager} the event manager, for chaining
 * @api public
 */

DelegateManager.prototype.unbind = function(str, method) {
  if (0 == arguments.length) {
    return this.unbind_all();
  }
  if (1 == arguments.length) {
    return this.unbind_all_of(event);
  }
  
  var target = this.target;
  var bindings = this._bindings;
  var event = parse(str);
  var name = event.name;
  var selector = event.selector;
  var method = method || 'on' + name;
  var functions = bindings[name];
  
  if (!functions) {
    return this;
  }
  
  var fn = functions[method];

  if (!fn) {
    return this;
  }

  delegate.unbind(target, name, fn, false);
  delete bindings[name][method];
  
  return this;
};

/**
 * unbind_all
 * Unbind all events.
 *
 * @api private
 */

DelegateManager.prototype.unbind_all = function() {
  var bindings = this._bindings;
  var event;
  
  for (event in bindings) {
    this.unbind_all_of(event);
  }

  return this;
};

/**
 * unbind_all_of
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

DelegateManager.prototype.unbind_all_of = function(event) {
  var bindings = this._bindings[event];
  var method;

  if (!bindings) {
    return this;
  }

  for (method in bindings) {
    this.unbind(event, method);
  }
  delete this._bindings[event];

  return this;
};


/*
 * parse
 * Parse event / selector string.
 *
 * @param {String} string
 * @return {Object}
 * @api private
 */

function parse(str) {
  var parts = str.split(' ');
  var event = parts.shift();
  var selector = parts.join(' ');

  return { name: event, selector: selector };
}

});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];
  
  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return [el.removeChild(el.lastChild)];
  }
  
  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  return orphan(el.children);
}

/**
 * Orphan `els` and return an array.
 *
 * @param {NodeList} els
 * @return {Array}
 * @api private
 */

function orphan(els) {
  var ret = [];

  while (els.length) {
    ret.push(els[0].parentNode.removeChild(els[0]));
  }

  return ret;
}

});
require.register("apily-view/index.js", function(exports, require, module){
/**
 * view
 * View component
 *
 * @copyright 2013 Enrico Marino and Federico Spini
 * @license MIT
 */ 

/**
 * Expose `View`
 */

module.exports = View;

/**
 * Module dependencies
 */

var Emitter = require('emitter');
var domify = require('domify');
var guid = require('guid');
var selectors = require('selectors-map');
var delegates = require('delegate-manager');

/**
 * View
 * Create a view.
 * 
 * @param {Object} options
 *   @param {Element} [options.container] element
 * @return {ViewModel} a viewmodel
 */

function View(options) {
  if (!(this instanceof View)) {
    return new View(options);
  }
  
  var options = options || {};
  var container = options.container;
  
  this.id = guid('view');
  this.el = domify(this.template)[0];
  this.elements = selectors(this.el, this.elements);
  this.delegates = delegates(this.el, this);
  this.delegates.bind_all(this.events);
  this.listeners = [];
  
  if (container) {
    this.container = container;
    this.container.appendChild(this.el);
  }
}

/**
 * Inherit from `Emitter`
 */

View.prototype = Object.create(Emitter.prototype);
View.prototype.constructor = View;

/**
 * @property {String} template
 */

View.prototype.template = '<div></div>';

/**
 * @property {Object} elements
 */

View.prototype.elements = {};

/**
 * @property {Object} events
 */

View.prototype.events = {};

/**
 * @method render
 * 
 * @return {View} this for chaining
 * @api public
 */

View.prototype.render = function () {
  return this;  
};

/**
 * delegate
 * 
 * @param {String} event event name
 * @param {String} method method name
 * @return {View} this for chaining
 * @api public
 */

View.prototype.delegate = function (event, method) {
  this.delegates.bind(event, method);
  return this;
};

/**
 * delegate_all
 * 
 * @param {Object} events events map
 * @return {View} this for chaining
 * @api public
 */

View.prototype.delegate_all = function (events) {
  this.delegates.bind_all(events);
  return this;
};

/**
 * undelegate
 * 
 * @param {String} event event name
 * @param {String} method method name
 * @return {View} this for chaining
 * @api public
 */

View.prototype.undelegate = function (event, method) {
  this.delegates.unbind(event, method);  
  return this;
};

/**
 * undelegate_all
 * 
 * @param {String} event event name
 * @return {View} this for chaining
 * @api public
 */

View.prototype.undelegate_all = function (event) {
  this.delegates.unbind_all_of(event);  
  return this;
};

/**
 * listen
 * 
 * @param {Emitter} emitter emitter
 * @param {String} event event name
 * @param {String} method method name
 * @return {View} this for chaining
 * @api public
 */

View.prototype.listen = function (emitter, event, method) {
  if (typeof event === 'object') {
    this.listen_all(emitter, event);
    return this;
  }
  emitter.on(event, this[method], this);
  return this;
};

/**
 * listen_all
 * 
 * @param {Emitter} emitter emitter
 * @param {Object} events events map
 *   @key {String} event event name
 *   @value {String} method method name
 * @return {View} this for chaining
 * @api public
 */

View.prototype.listen_all = function (emitter, events) {
  var event;
  for (event in events) {
    this.listen(emitter, event, events[event]);    
  }
  return this;
};

/**
 * unlisten
 * 
 * @param {Emitter} emitter emitter
 * @param {String} event event name
 * @param {String} method method name
 * @return {View} this for chaining
 * @api public
 */

View.prototype.unlisten = function (emitter, event, method) {
  if (typeof event === 'object') {
    this.listen_all(emitter, event);
    return this;
  }
  emitter.off(event, this[method]);
};

/**
 * unlisten_all
 * 
 * @param {Emitter} emitter emitter
 * @param {Object} events events map
 *   @key {String} event event name
 *   @value {String} method method name
 * @return {View} this for chaining
 * @api public
 */

View.prototype.unlisten_all = function (emitter, events) {
  var event;
  for (event in events) {
    this.unlisten(emitter, event, events[event]);    
  }
  return this;
};

/**
 * @method into
 * @description append this view into `container`
 * @param {Element} container container
 * @return {View} this for chaining
 * @api public
 */

View.prototype.into = function (container) {
  container.appendChild(this.el); 
  this.container = container;
  return this;
};

/**
 * @method show
 * @description show this view
 * @return {View} this for chaining
 * @api public
 */

View.prototype.show = function () {
  this.el.style.display = 'block';
  return this;
};

/**
 * @method hide
 * @description hide this view
 * @return {View} this for chaining
 * @api public
 */

View.prototype.hide = function () {
  this.el.style.display = 'none';
  return this;
};

});
require.register("happygui-element/index.js", function(exports, require, module){
function Element(options) {
  options = options || {};
  this.type = options.type;
  this.isDeletable = options.isDeletable;
}

module.exports = Element;
});
require.register("boot/boot.js", function(exports, require, module){

});
require.alias("component-emitter/index.js", "happygui/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("boot/boot.js", "happygui/deps/boot/boot.js");
require.alias("boot/boot.js", "happygui/deps/boot/index.js");
require.alias("apily-router/index.js", "boot/deps/router/index.js");
require.alias("apily-history/index.js", "apily-router/deps/history/index.js");
require.alias("apily-emitter/index.js", "apily-history/deps/emitter/index.js");

require.alias("apily-emitter/index.js", "apily-router/deps/emitter/index.js");

require.alias("apily-history/index.js", "boot/deps/history/index.js");
require.alias("apily-emitter/index.js", "apily-history/deps/emitter/index.js");

require.alias("apily-view/index.js", "boot/deps/view/index.js");
require.alias("apily-guid/index.js", "apily-view/deps/guid/index.js");

require.alias("apily-emitter/index.js", "apily-view/deps/emitter/index.js");

require.alias("apily-selectors-map/index.js", "apily-view/deps/selectors-map/index.js");

require.alias("apily-delegate-manager/index.js", "apily-view/deps/delegate-manager/index.js");
require.alias("component-delegate/index.js", "apily-delegate-manager/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "apily-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "boot/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("happygui-element/index.js", "boot/deps/happygui-element/index.js");

require.alias("boot/boot.js", "boot/index.js");

