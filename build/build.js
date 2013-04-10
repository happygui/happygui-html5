

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
require.register("component-hammer.js/index.js", function(exports, require, module){
/*
 * Hammer.JS
 * version 0.6.1
 * author: Eight Media
 * https://github.com/EightMedia/hammer.js
 * Licensed under the MIT license.
 */
function Hammer(element, options, undefined)
{
    var self = this;

    var defaults = {
        // prevent the default event or not... might be buggy when false
        prevent_default    : false,
        css_hacks          : true,

        swipe              : true,
        swipe_time         : 200,   // ms
        swipe_min_distance : 20, // pixels

        drag               : true,
        drag_vertical      : true,
        drag_horizontal    : true,
        // minimum distance before the drag event starts
        drag_min_distance  : 20, // pixels

        // pinch zoom and rotation
        transform          : true,
        scale_treshold     : 0.1,
        rotation_treshold  : 15, // degrees

        tap                : true,
        tap_double         : true,
        tap_max_interval   : 300,
        tap_max_distance   : 10,
        tap_double_distance: 20,

        hold               : true,
        hold_timeout       : 500
    };
    options = mergeObject(defaults, options);

    // some css hacks
    (function() {
        if(!options.css_hacks) {
            return false;
        }

        var vendors = ['webkit','moz','ms','o',''];
        var css_props = {
            "userSelect": "none",
            "touchCallout": "none",
            "userDrag": "none",
            "tapHighlightColor": "rgba(0,0,0,0)"
        };

        var prop = '';
        for(var i = 0; i < vendors.length; i++) {
            for(var p in css_props) {
                prop = p;
                if(vendors[i]) {
                    prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
                }
                element.style[ prop ] = css_props[p];
            }
        }
    })();

    // holds the distance that has been moved
    var _distance = 0;

    // holds the exact angle that has been moved
    var _angle = 0;

    // holds the diraction that has been moved
    var _direction = 0;

    // holds position movement for sliding
    var _pos = { };

    // how many fingers are on the screen
    var _fingers = 0;

    var _first = false;

    var _gesture = null;
    var _prev_gesture = null;

    var _touch_start_time = null;
    var _prev_tap_pos = {x: 0, y: 0};
    var _prev_tap_end_time = null;

    var _hold_timer = null;

    var _offset = {};

    // keep track of the mouse status
    var _mousedown = false;

    var _event_start;
    var _event_move;
    var _event_end;

    var _has_touch = ('ontouchstart' in window);


    /**
     * option setter/getter
     * @param   string  key
     * @param   mixed   value
     * @return  mixed   value
     */
    this.option = function(key, val) {
        if(val != undefined) {
            options[key] = val;
        }

        return options[key];
    };


    /**
     * angle to direction define
     * @param  float    angle
     * @return string   direction
     */
    this.getDirectionFromAngle = function( angle ) {
        var directions = {
            down: angle >= 45 && angle < 135, //90
            left: angle >= 135 || angle <= -135, //180
            up: angle < -45 && angle > -135, //270
            right: angle >= -45 && angle <= 45 //0
        };

        var direction, key;
        for(key in directions){
            if(directions[key]){
                direction = key;
                break;
            }
        }
        return direction;
    };


    /**
     * destory events
     * @return  void
     */
    this.destroy = function() {
        if(_has_touch) {
            removeEvent(element, "touchstart touchmove touchend touchcancel", handleEvents);
        }
        // for non-touch
        else {
            removeEvent(element, "mouseup mousedown mousemove", handleEvents);
            removeEvent(element, "mouseout", handleMouseOut);
        }
    };


    /**
     * count the number of fingers in the event
     * when no fingers are detected, one finger is returned (mouse pointer)
     * @param  event
     * @return int  fingers
     */
    function countFingers( event )
    {
        // there is a bug on android (until v4?) that touches is always 1,
        // so no multitouch is supported, e.g. no, zoom and rotation...
        return event.touches ? event.touches.length : 1;
    }


    /**
     * get the x and y positions from the event object
     * @param  event
     * @return array  [{ x: int, y: int }]
     */
    function getXYfromEvent( event )
    {
        event = event || window.event;

        // no touches, use the event pageX and pageY
        if(!_has_touch) {
            var doc = document,
                body = doc.body;

            return [{
                x: event.pageX || event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && doc.clientLeft || 0 ),
                y: event.pageY || event.clientY + ( doc && doc.scrollTop || body && body.scrollTop || 0 ) - ( doc && doc.clientTop || body && doc.clientTop || 0 )
            }];
        }
        // multitouch, return array with positions
        else {
            var pos = [], src;
            for(var t=0, len=event.touches.length; t<len; t++) {
                src = event.touches[t];
                pos.push({ x: src.pageX, y: src.pageY });
            }
            return pos;
        }
    }


    /**
     * calculate the angle between two points
     * @param   object  pos1 { x: int, y: int }
     * @param   object  pos2 { x: int, y: int }
     */
    function getAngle( pos1, pos2 )
    {
        return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x) * 180 / Math.PI;
    }


    /**
     * calculate the scale size between two fingers
     * @param   object  pos_start
     * @param   object  pos_move
     * @return  float   scale
     */
    function calculateScale(pos_start, pos_move)
    {
        if(pos_start.length == 2 && pos_move.length == 2) {
            var x, y;

            x = pos_start[0].x - pos_start[1].x;
            y = pos_start[0].y - pos_start[1].y;
            var start_distance = Math.sqrt((x*x) + (y*y));

            x = pos_move[0].x - pos_move[1].x;
            y = pos_move[0].y - pos_move[1].y;
            var end_distance = Math.sqrt((x*x) + (y*y));

            return end_distance / start_distance;
        }

        return 0;
    }


    /**
     * calculate the rotation degrees between two fingers
     * @param   object  pos_start
     * @param   object  pos_move
     * @return  float   rotation
     */
    function calculateRotation(pos_start, pos_move)
    {
        if(pos_start.length == 2 && pos_move.length == 2) {
            var x, y;

            x = pos_start[0].x - pos_start[1].x;
            y = pos_start[0].y - pos_start[1].y;
            var start_rotation = Math.atan2(y, x) * 180 / Math.PI;

            x = pos_move[0].x - pos_move[1].x;
            y = pos_move[0].y - pos_move[1].y;
            var end_rotation = Math.atan2(y, x) * 180 / Math.PI;

            return end_rotation - start_rotation;
        }

        return 0;
    }


    /**
     * trigger an event/callback by name with params
     * @param string name
     * @param array  params
     */
    function triggerEvent( eventName, params )
    {
        // return touches object
        params.touches = getXYfromEvent(params.originalEvent);
        params.type = eventName;

        // trigger callback
        if(isFunction(self["on"+ eventName])) {
            self["on"+ eventName].call(self, params);
        }
    }


    /**
     * cancel event
     * @param   object  event
     * @return  void
     */

    function cancelEvent(event)
    {
        event = event || window.event;
        if(event.preventDefault){
            event.preventDefault();
            event.stopPropagation();
        }else{
            event.returnValue = false;
            event.cancelBubble = true;
        }
    }


    /**
     * reset the internal vars to the start values
     */
    function reset()
    {
        _pos = {};
        _first = false;
        _fingers = 0;
        _distance = 0;
        _angle = 0;
        _gesture = null;
    }


    var gestures = {
        // hold gesture
        // fired on touchstart
        hold : function(event)
        {
            // only when one finger is on the screen
            if(options.hold) {
                _gesture = 'hold';
                clearTimeout(_hold_timer);

                _hold_timer = setTimeout(function() {
                    if(_gesture == 'hold') {
                        triggerEvent("hold", {
                            originalEvent   : event,
                            position        : _pos.start
                        });
                    }
                }, options.hold_timeout);
            }
        },

        // swipe gesture
        // fired on touchend
        swipe : function(event)
        {
            if(!_pos.move) {
                return;
            }

            // get the distance we moved
            var _distance_x = _pos.move[0].x - _pos.start[0].x;
            var _distance_y = _pos.move[0].y - _pos.start[0].y;
            _distance = Math.sqrt(_distance_x*_distance_x + _distance_y*_distance_y);

            // compare the kind of gesture by time
            var now = new Date().getTime();
            var touch_time = now - _touch_start_time;

            if(options.swipe && (options.swipe_time > touch_time) && (_distance > options.swipe_min_distance)) {
                // calculate the angle
                _angle = getAngle(_pos.start[0], _pos.move[0]);
                _direction = self.getDirectionFromAngle(_angle);

                _gesture = 'swipe';

                var position = { x: _pos.move[0].x - _offset.left,
                    y: _pos.move[0].y - _offset.top };

                var event_obj = {
                    originalEvent   : event,
                    position        : position,
                    direction       : _direction,
                    distance        : _distance,
                    distanceX       : _distance_x,
                    distanceY       : _distance_y,
                    angle           : _angle
                };

                // normal slide event
                triggerEvent("swipe", event_obj);
            }
        },


        // drag gesture
        // fired on mousemove
        drag : function(event)
        {
            // get the distance we moved
            var _distance_x = _pos.move[0].x - _pos.start[0].x;
            var _distance_y = _pos.move[0].y - _pos.start[0].y;
            _distance = Math.sqrt(_distance_x * _distance_x + _distance_y * _distance_y);

            // drag
            // minimal movement required
            if(options.drag && (_distance > options.drag_min_distance) || _gesture == 'drag') {
                // calculate the angle
                _angle = getAngle(_pos.start[0], _pos.move[0]);
                _direction = self.getDirectionFromAngle(_angle);

                // check the movement and stop if we go in the wrong direction
                var is_vertical = (_direction == 'up' || _direction == 'down');
                if(((is_vertical && !options.drag_vertical) || (!is_vertical && !options.drag_horizontal))
                    && (_distance > options.drag_min_distance)) {
                    return;
                }

                _gesture = 'drag';

                var position = { x: _pos.move[0].x - _offset.left,
                    y: _pos.move[0].y - _offset.top };

                var event_obj = {
                    originalEvent   : event,
                    position        : position,
                    direction       : _direction,
                    distance        : _distance,
                    distanceX       : _distance_x,
                    distanceY       : _distance_y,
                    angle           : _angle
                };

                // on the first time trigger the start event
                if(_first) {
                    triggerEvent("dragstart", event_obj);

                    _first = false;
                }

                // normal slide event
                triggerEvent("drag", event_obj);

                cancelEvent(event);
            }
        },


        // transform gesture
        // fired on touchmove
        transform : function(event)
        {
            if(options.transform) {
                if(countFingers(event) != 2) {
                    return false;
                }

                var rotation = calculateRotation(_pos.start, _pos.move);
                var scale = calculateScale(_pos.start, _pos.move);

                if(_gesture != 'drag' &&
                    (_gesture == 'transform' || Math.abs(1-scale) > options.scale_treshold || Math.abs(rotation) > options.rotation_treshold)) {
                    _gesture = 'transform';

                    _pos.center = {  x: ((_pos.move[0].x + _pos.move[1].x) / 2) - _offset.left,
                        y: ((_pos.move[0].y + _pos.move[1].y) / 2) - _offset.top };

                    var event_obj = {
                        originalEvent   : event,
                        position        : _pos.center,
                        scale           : scale,
                        rotation        : rotation
                    };

                    // on the first time trigger the start event
                    if(_first) {
                        triggerEvent("transformstart", event_obj);
                        _first = false;
                    }

                    triggerEvent("transform", event_obj);

                    cancelEvent(event);

                    return true;
                }
            }

            return false;
        },


        // tap and double tap gesture
        // fired on touchend
        tap : function(event)
        {
            // compare the kind of gesture by time
            var now = new Date().getTime();
            var touch_time = now - _touch_start_time;

            // dont fire when hold is fired
            if(options.hold && !(options.hold && options.hold_timeout > touch_time)) {
                return;
            }

            // when previous event was tap and the tap was max_interval ms ago
            var is_double_tap = (function(){
                if (_prev_tap_pos &&
                    options.tap_double &&
                    _prev_gesture == 'tap' &&
                    (_touch_start_time - _prev_tap_end_time) < options.tap_max_interval)
                {
                    var x_distance = Math.abs(_prev_tap_pos[0].x - _pos.start[0].x);
                    var y_distance = Math.abs(_prev_tap_pos[0].y - _pos.start[0].y);
                    return (_prev_tap_pos && _pos.start && Math.max(x_distance, y_distance) < options.tap_double_distance);
                }
                return false;
            })();

            if(is_double_tap) {
                _gesture = 'double_tap';
                _prev_tap_end_time = null;

                triggerEvent("doubletap", {
                    originalEvent   : event,
                    position        : _pos.start
                });
                cancelEvent(event);
            }

            // single tap is single touch
            else {
                var x_distance = (_pos.move) ? Math.abs(_pos.move[0].x - _pos.start[0].x) : 0;
                var y_distance =  (_pos.move) ? Math.abs(_pos.move[0].y - _pos.start[0].y) : 0;
                _distance = Math.max(x_distance, y_distance);

                if(_distance < options.tap_max_distance) {
                    _gesture = 'tap';
                    _prev_tap_end_time = now;
                    _prev_tap_pos = _pos.start;

                    if(options.tap) {
                        triggerEvent("tap", {
                            originalEvent   : event,
                            position        : _pos.start
                        });
                        cancelEvent(event);
                    }
                }
            }

        }

    };


    function handleEvents(event)
    {
        switch(event.type)
        {
            case 'mousedown':
            case 'touchstart':
                _pos.start = getXYfromEvent(event);
                _touch_start_time = new Date().getTime();
                _fingers = countFingers(event);
                _first = true;
                _event_start = event;

                // borrowed from jquery offset https://github.com/jquery/jquery/blob/master/src/offset.js
                var box = element.getBoundingClientRect();
                var clientTop  = element.clientTop  || document.body.clientTop  || 0;
                var clientLeft = element.clientLeft || document.body.clientLeft || 0;
                var scrollTop  = window.pageYOffset || element.scrollTop  || document.body.scrollTop;
                var scrollLeft = window.pageXOffset || element.scrollLeft || document.body.scrollLeft;

                _offset = {
                    top: box.top + scrollTop - clientTop,
                    left: box.left + scrollLeft - clientLeft
                };

                _mousedown = true;

                // hold gesture
                gestures.hold(event);

                if(options.prevent_default) {
                    cancelEvent(event);
                }
                break;

            case 'mousemove':
            case 'touchmove':
                if(!_mousedown) {
                    return false;
                }
                _event_move = event;
                _pos.move = getXYfromEvent(event);

                if(!gestures.transform(event)) {
                    gestures.drag(event);
                }
                break;

            case 'mouseup':
            case 'mouseout':
            case 'touchcancel':
            case 'touchend':
                if(!_mousedown || (_gesture != 'transform' && event.touches && event.touches.length > 0)) {
                    return false;
                }

                _mousedown = false;
                _event_end = event;


                // swipe gesture
                gestures.swipe(event);


                // drag gesture
                // dragstart is triggered, so dragend is possible
                if(_gesture == 'drag') {
                    triggerEvent("dragend", {
                        originalEvent   : event,
                        direction       : _direction,
                        distance        : _distance,
                        angle           : _angle
                    });
                }

                // transform
                // transformstart is triggered, so transformed is possible
                else if(_gesture == 'transform') {
                    triggerEvent("transformend", {
                        originalEvent   : event,
                        position        : _pos.center,
                        scale           : calculateScale(_pos.start, _pos.move),
                        rotation        : calculateRotation(_pos.start, _pos.move)
                    });
                }
                else {
                    gestures.tap(_event_start);
                }

                _prev_gesture = _gesture;

                // trigger release event
                triggerEvent("release", {
                    originalEvent   : event,
                    gesture         : _gesture
                });

                // reset vars
                reset();
                break;
        }
    }


    function handleMouseOut(event) {
        if(!isInsideHammer(element, event.relatedTarget)) {
            handleEvents(event);
        }
    }


    // bind events for touch devices
    // except for windows phone 7.5, it doesnt support touch events..!
    if(_has_touch) {
        addEvent(element, "touchstart touchmove touchend touchcancel", handleEvents);
    }
    // for non-touch
    else {
        addEvent(element, "mouseup mousedown mousemove", handleEvents);
        addEvent(element, "mouseout", handleMouseOut);
    }


    /**
     * find if element is (inside) given parent element
     * @param   object  element
     * @param   object  parent
     * @return  bool    inside
     */
    function isInsideHammer(parent, child) {
        // get related target for IE
        if(!child && window.event && window.event.toElement){
            child = window.event.toElement;
        }

        if(parent === child){
            return true;
        }

        // loop over parentNodes of child until we find hammer element
        if(child){
            var node = child.parentNode;
            while(node !== null){
                if(node === parent){
                    return true;
                };
                node = node.parentNode;
            }
        }
        return false;
    }


    /**
     * merge 2 objects into a new object
     * @param   object  obj1
     * @param   object  obj2
     * @return  object  merged object
     */
    function mergeObject(obj1, obj2) {
        var output = {};

        if(!obj2) {
            return obj1;
        }

        for (var prop in obj1) {
            if (prop in obj2) {
                output[prop] = obj2[prop];
            } else {
                output[prop] = obj1[prop];
            }
        }
        return output;
    }


    /**
     * check if object is a function
     * @param   object  obj
     * @return  bool    is function
     */
    function isFunction( obj ){
        return Object.prototype.toString.call( obj ) == "[object Function]";
    }


    /**
     * attach event
     * @param   node    element
     * @param   string  types
     * @param   object  callback
     */
    function addEvent(element, types, callback) {
        types = types.split(" ");
        for(var t= 0,len=types.length; t<len; t++) {
            if(element.addEventListener){
                element.addEventListener(types[t], callback, false);
            }
            else if(document.attachEvent){
                element.attachEvent("on"+ types[t], callback);
            }
        }
    }


    /**
     * detach event
     * @param   node    element
     * @param   string  types
     * @param   object  callback
     */
    function removeEvent(element, types, callback) {
        types = types.split(" ");
        for(var t= 0,len=types.length; t<len; t++) {
            if(element.removeEventListener){
                element.removeEventListener(types[t], callback, false);
            }
            else if(document.detachEvent){
                element.detachEvent("on"+ types[t], callback);
            }
        }
    }
}

module.exports = Hammer;
});
require.register("component-gesture/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Hammer = require('hammer')
  , Emitter = require('emitter');

/**
 * Bind gestures to `el`.
 *
 * @param {Element} el
 * @return {Gesture}
 * @api public
 */

module.exports = function(el){
  return new Gesture(el);
};

/**
 * Initalize a new `Gesture` with the given `el`.
 *
 * @param {Element} el
 * @api public
 */

function Gesture(el) {
  Emitter.call(this);
  this.hammer = new Hammer(el);
  this.el = el;
  this.bind();
}

/**
 * Inherits from `Emitter.prototype`.
 */

Gesture.prototype.__proto__ = Emitter.prototype;

/**
 * Bind to hammer.js events.
 *
 * @api private
 */

Gesture.prototype.bind = function(){
  var self = this;
  var hammer = this.hammer;

  // drag start
  hammer.ondragstart = function(e){
    self.emit('drag start', e);
  };

  // drag
  hammer.ondrag = function(e){
    self.emit('drag', e);
  };

  // drag end
  hammer.ondragend = function(e){
    self.emit('drag end', e);
  };

  // tag
  hammer.ontap = function(e){
    self.emit('tap', e);
  };

  // double tag
  hammer.ondoubletap = function(e){
    self.emit('double tap', e);
  };

  // hold
  hammer.onhold = function(e){
    self.emit('hold', e);
  };

  // release
  hammer.onrelease = function(e){
    self.emit('release', e);
  };

  // transform start
  hammer.ontransformstart = function(e){
    self.emit('transform start', e);
  };

  // transform
  hammer.ontransform = function(e){
    self.emit('transform', e);
  };

  // transform end
  hammer.ontransformend = function(e){
    self.emit('transform end', e);
  };

  // swipe left / right
  hammer.onswipe = function(e){
    self.emit('swipe', e);
    self.emit('swipe ' + e.direction, e);
  };
};

/**
 * Unbind events.
 *
 * @api public
 */

Gesture.prototype.unbind = function(){
  this.hammer.destroy();
};


});
require.register("adobe-webplatform-eve/eve.js", function(exports, require, module){
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.4.2 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\

(function (glob) {
    var version = "0.4.2",
        has = "hasOwnProperty",
        separator = /[\.\/]/,
        wildcard = "*",
        fun = function () {},
        numsort = function (a, b) {
            return a - b;
        },
        current_event,
        stop,
        events = {n: {}},
    /*\
     * eve
     [ method ]

     * Fires event with given `name`, given scope and other parameters.

     > Arguments

     - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
     - scope (object) context for the event handlers
     - varargs (...) the rest of arguments will be sent to event handlers

     = (object) array of returned values from the listeners
    \*/
        eve = function (name, scope) {
			name = String(name);
            var e = events,
                oldstop = stop,
                args = Array.prototype.slice.call(arguments, 2),
                listeners = eve.listeners(name),
                z = 0,
                f = false,
                l,
                indexed = [],
                queue = {},
                out = [],
                ce = current_event,
                errors = [];
            current_event = name;
            stop = 0;
            for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
                indexed.push(listeners[i].zIndex);
                if (listeners[i].zIndex < 0) {
                    queue[listeners[i].zIndex] = listeners[i];
                }
            }
            indexed.sort(numsort);
            while (indexed[z] < 0) {
                l = queue[indexed[z++]];
                out.push(l.apply(scope, args));
                if (stop) {
                    stop = oldstop;
                    return out;
                }
            }
            for (i = 0; i < ii; i++) {
                l = listeners[i];
                if ("zIndex" in l) {
                    if (l.zIndex == indexed[z]) {
                        out.push(l.apply(scope, args));
                        if (stop) {
                            break;
                        }
                        do {
                            z++;
                            l = queue[indexed[z]];
                            l && out.push(l.apply(scope, args));
                            if (stop) {
                                break;
                            }
                        } while (l)
                    } else {
                        queue[l.zIndex] = l;
                    }
                } else {
                    out.push(l.apply(scope, args));
                    if (stop) {
                        break;
                    }
                }
            }
            stop = oldstop;
            current_event = ce;
            return out.length ? out : null;
        };
		// Undocumented. Debug only.
		eve._events = events;
    /*\
     * eve.listeners
     [ method ]

     * Internal method which gives you array of all event handlers that will be triggered by the given `name`.

     > Arguments

     - name (string) name of the event, dot (`.`) or slash (`/`) separated

     = (array) array of event handlers
    \*/
    eve.listeners = function (name) {
        var names = name.split(separator),
            e = events,
            item,
            items,
            k,
            i,
            ii,
            j,
            jj,
            nes,
            es = [e],
            out = [];
        for (i = 0, ii = names.length; i < ii; i++) {
            nes = [];
            for (j = 0, jj = es.length; j < jj; j++) {
                e = es[j].n;
                items = [e[names[i]], e[wildcard]];
                k = 2;
                while (k--) {
                    item = items[k];
                    if (item) {
                        nes.push(item);
                        out = out.concat(item.f || []);
                    }
                }
            }
            es = nes;
        }
        return out;
    };
    
    /*\
     * eve.on
     [ method ]
     **
     * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
     | eve.on("*.under.*", f);
     | eve("mouse.under.floor"); // triggers f
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
     > Example:
     | eve.on("mouse", eatIt)(2);
     | eve.on("mouse", scream);
     | eve.on("mouse", catchIt)(1);
     * This will ensure that `catchIt()` function will be called before `eatIt()`.
	 *
     * If you want to put your handler before non-indexed handlers, specify a negative value.
     * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
    \*/
    eve.on = function (name, f) {
		name = String(name);
		if (typeof f != "function") {
			return function () {};
		}
        var names = name.split(separator),
            e = events;
        for (var i = 0, ii = names.length; i < ii; i++) {
            e = e.n;
            e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {n: {}});
        }
        e.f = e.f || [];
        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
            return fun;
        }
        e.f.push(f);
        return function (zIndex) {
            if (+zIndex == +zIndex) {
                f.zIndex = +zIndex;
            }
        };
    };
    /*\
     * eve.f
     [ method ]
     **
     * Returns function that will fire given event with optional arguments.
	 * Arguments that will be passed to the result function will be also
	 * concated to the list of final arguments.
 	 | el.onclick = eve.f("click", 1, 2);
 	 | eve.on("click", function (a, b, c) {
 	 |     console.log(a, b, c); // 1, 2, [event object]
 	 | });
     > Arguments
	 - event (string) event name
	 - varargs (…) and any other arguments
	 = (function) possible event handler function
    \*/
	eve.f = function (event) {
		var attrs = [].slice.call(arguments, 1);
		return function () {
			eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
		};
	};
    /*\
     * eve.stop
     [ method ]
     **
     * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
    \*/
    eve.stop = function () {
        stop = 1;
    };
    /*\
     * eve.nt
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     > Arguments
     **
     - subname (string) #optional subname of the event
     **
     = (string) name of the event, if `subname` is not specified
     * or
     = (boolean) `true`, if current event’s name contains `subname`
    \*/
    eve.nt = function (subname) {
        if (subname) {
            return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(current_event);
        }
        return current_event;
    };
    /*\
     * eve.nts
     [ method ]
     **
     * Could be used inside event handler to figure out actual name of the event.
     **
     **
     = (array) names of the event
    \*/
    eve.nts = function () {
        return current_event.split(separator);
    };
    /*\
     * eve.off
     [ method ]
     **
     * Removes given function from the list of event listeners assigned to given name.
	 * If no arguments specified all the events will be cleared.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
    \*/
    /*\
     * eve.unbind
     [ method ]
     **
     * See @eve.off
    \*/
    eve.off = eve.unbind = function (name, f) {
		if (!name) {
		    eve._events = events = {n: {}};
			return;
		}
        var names = name.split(separator),
            e,
            key,
            splice,
            i, ii, j, jj,
            cur = [events];
        for (i = 0, ii = names.length; i < ii; i++) {
            for (j = 0; j < cur.length; j += splice.length - 2) {
                splice = [j, 1];
                e = cur[j].n;
                if (names[i] != wildcard) {
                    if (e[names[i]]) {
                        splice.push(e[names[i]]);
                    }
                } else {
                    for (key in e) if (e[has](key)) {
                        splice.push(e[key]);
                    }
                }
                cur.splice.apply(cur, splice);
            }
        }
        for (i = 0, ii = cur.length; i < ii; i++) {
            e = cur[i];
            while (e.n) {
                if (f) {
                    if (e.f) {
                        for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
                            e.f.splice(j, 1);
                            break;
                        }
                        !e.f.length && delete e.f;
                    }
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        var funcs = e.n[key].f;
                        for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
                            funcs.splice(j, 1);
                            break;
                        }
                        !funcs.length && delete e.n[key].f;
                    }
                } else {
                    delete e.f;
                    for (key in e.n) if (e.n[has](key) && e.n[key].f) {
                        delete e.n[key].f;
                    }
                }
                e = e.n;
            }
        }
    };
    /*\
     * eve.once
     [ method ]
     **
     * Binds given event handler with a given name to only run once then unbind itself.
     | eve.once("login", f);
     | eve("login"); // triggers f
     | eve("login"); // no listeners
     * Use @eve to trigger the listener.
     **
     > Arguments
     **
     - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
     - f (function) event handler function
     **
     = (function) same return function as @eve.on
    \*/
    eve.once = function (name, f) {
        var f2 = function () {
            eve.unbind(name, f2);
            return f.apply(this, arguments);
        };
        return eve.on(name, f2);
    };
    /*\
     * eve.version
     [ property (string) ]
     **
     * Current version of the library.
    \*/
    eve.version = version;
    eve.toString = function () {
        return "You are running Eve " + version;
    };
    (typeof module != "undefined" && module.exports) ? (module.exports = eve) : (typeof define != "undefined" ? (define("eve", [], function() { return eve; })) : (glob.eve = eve));
})(this);

});
require.register("richthegeek-raphael/raphael-min.js", function(exports, require, module){
// ┌────────────────────────────────────────────────────────────────────┐ \\
// │ Raphaël 2.1.0 - JavaScript Vector Library                          │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)    │ \\
// │ Copyright © 2008-2012 Sencha Labs (http://sencha.com)              │ \\
// ├────────────────────────────────────────────────────────────────────┤ \\
// │ Licensed under the MIT (http://raphaeljs.com/license.html) license.│ \\
// └────────────────────────────────────────────────────────────────────┘ \\
(function(){function t(e){if(t.is(e,"function"))return m?e():eve.on("raphael.DOMload",e);if(t.is(e,N))return t._engine.create[F](t,e.splice(0,3+t.is(e[0],G))).add(e);var r=Array.prototype.slice.call(arguments,0);if(t.is(r[r.length-1],"function")){var n=r.pop();return m?n.call(t._engine.create[F](t,r)):eve.on("raphael.DOMload",function(){n.call(t._engine.create[F](t,r))})}return t._engine.create[F](t,arguments)}function e(t){if(Object(t)!==t)return t;var r=new t.constructor;for(var n in t)t[k](n)&&(r[n]=e(t[n]));return r}function r(t,e){for(var r=0,n=t.length;n>r;r++)if(t[r]===e)return t.push(t.splice(r,1)[0])}function n(t,e,n){function i(){var a=Array.prototype.slice.call(arguments,0),s=a.join("␀"),o=i.cache=i.cache||{},u=i.count=i.count||[];return o[k](s)?(r(u,s),n?n(o[s]):o[s]):(u.length>=1e3&&delete o[u.shift()],u.push(s),o[s]=t[F](e,a),n?n(o[s]):o[s])}return i}function i(){return this.hex}function a(t,e){for(var r=[],n=0,i=t.length;i-2*!e>n;n+=2){var a=[{x:+t[n-2],y:+t[n-1]},{x:+t[n],y:+t[n+1]},{x:+t[n+2],y:+t[n+3]},{x:+t[n+4],y:+t[n+5]}];e?n?i-4==n?a[3]={x:+t[0],y:+t[1]}:i-2==n&&(a[2]={x:+t[0],y:+t[1]},a[3]={x:+t[2],y:+t[3]}):a[0]={x:+t[i-2],y:+t[i-1]}:i-4==n?a[3]=a[2]:n||(a[0]={x:+t[n],y:+t[n+1]}),r.push(["C",(-a[0].x+6*a[1].x+a[2].x)/6,(-a[0].y+6*a[1].y+a[2].y)/6,(a[1].x+6*a[2].x-a[3].x)/6,(a[1].y+6*a[2].y-a[3].y)/6,a[2].x,a[2].y])}return r}function s(t,e,r,n,i){var a=-3*e+9*r-9*n+3*i,s=t*a+6*e-12*r+6*n;return t*s-3*e+3*r}function o(t,e,r,n,i,a,o,u,h){null==h&&(h=1),h=h>1?1:0>h?0:h;for(var l=h/2,c=12,f=[-.1252,.1252,-.3678,.3678,-.5873,.5873,-.7699,.7699,-.9041,.9041,-.9816,.9816],p=[.2491,.2491,.2335,.2335,.2032,.2032,.1601,.1601,.1069,.1069,.0472,.0472],d=0,g=0;c>g;g++){var x=l*f[g]+l,v=s(x,t,r,i,o),m=s(x,e,n,a,u),y=v*v+m*m;d+=p[g]*D.sqrt(y)}return l*d}function u(t,e,r,n,i,a,s,u,h){if(!(0>h||h>o(t,e,r,n,i,a,s,u))){var l,c=1,f=c/2,p=c-f,d=.01;for(l=o(t,e,r,n,i,a,s,u,p);z(l-h)>d;)f/=2,p+=(h>l?1:-1)*f,l=o(t,e,r,n,i,a,s,u,p);return p}}function h(t,e,r,n,i,a,s,o){if(!(I(t,r)<O(i,s)||O(t,r)>I(i,s)||I(e,n)<O(a,o)||O(e,n)>I(a,o))){var u=(t*n-e*r)*(i-s)-(t-r)*(i*o-a*s),h=(t*n-e*r)*(a-o)-(e-n)*(i*o-a*s),l=(t-r)*(a-o)-(e-n)*(i-s);if(l){var c=u/l,f=h/l,p=+c.toFixed(2),d=+f.toFixed(2);if(!(+O(t,r).toFixed(2)>p||p>+I(t,r).toFixed(2)||+O(i,s).toFixed(2)>p||p>+I(i,s).toFixed(2)||+O(e,n).toFixed(2)>d||d>+I(e,n).toFixed(2)||+O(a,o).toFixed(2)>d||d>+I(a,o).toFixed(2)))return{x:c,y:f}}}}function l(e,r,n){var i=t.bezierBBox(e),a=t.bezierBBox(r);if(!t.isBBoxIntersect(i,a))return n?0:[];for(var s=o.apply(0,e),u=o.apply(0,r),l=~~(s/5),c=~~(u/5),f=[],p=[],d={},g=n?0:[],x=0;l+1>x;x++){var v=t.findDotsAtSegment.apply(t,e.concat(x/l));f.push({x:v.x,y:v.y,t:x/l})}for(x=0;c+1>x;x++)v=t.findDotsAtSegment.apply(t,r.concat(x/c)),p.push({x:v.x,y:v.y,t:x/c});for(x=0;l>x;x++)for(var m=0;c>m;m++){var y=f[x],b=f[x+1],_=p[m],w=p[m+1],k=.001>z(b.x-y.x)?"y":"x",B=.001>z(w.x-_.x)?"y":"x",S=h(y.x,y.y,b.x,b.y,_.x,_.y,w.x,w.y);if(S){if(d[S.x.toFixed(4)]==S.y.toFixed(4))continue;d[S.x.toFixed(4)]=S.y.toFixed(4);var C=y.t+z((S[k]-y[k])/(b[k]-y[k]))*(b.t-y.t),F=_.t+z((S[B]-_[B])/(w[B]-_[B]))*(w.t-_.t);C>=0&&1>=C&&F>=0&&1>=F&&(n?g++:g.push({x:S.x,y:S.y,t1:C,t2:F}))}}return g}function c(e,r,n){e=t._path2curve(e),r=t._path2curve(r);for(var i,a,s,o,u,h,c,f,p,d,g=n?0:[],x=0,v=e.length;v>x;x++){var m=e[x];if("M"==m[0])i=u=m[1],a=h=m[2];else{"C"==m[0]?(p=[i,a].concat(m.slice(1)),i=p[6],a=p[7]):(p=[i,a,i,a,u,h,u,h],i=u,a=h);for(var y=0,b=r.length;b>y;y++){var _=r[y];if("M"==_[0])s=c=_[1],o=f=_[2];else{"C"==_[0]?(d=[s,o].concat(_.slice(1)),s=d[6],o=d[7]):(d=[s,o,s,o,c,f,c,f],s=c,o=f);var w=l(p,d,n);if(n)g+=w;else{for(var k=0,B=w.length;B>k;k++)w[k].segment1=x,w[k].segment2=y,w[k].bez1=p,w[k].bez2=d;g=g.concat(w)}}}}}return g}function f(t,e,r,n,i,a){null!=t?(this.a=+t,this.b=+e,this.c=+r,this.d=+n,this.e=+i,this.f=+a):(this.a=1,this.b=0,this.c=0,this.d=1,this.e=0,this.f=0)}function p(){return this.x+M+this.y+M+this.width+" × "+this.height}function d(t,e,r,n,i,a){function s(t){return((c*t+l)*t+h)*t}function o(t,e){var r=u(t,e);return((d*r+p)*r+f)*r}function u(t,e){var r,n,i,a,o,u;for(i=t,u=0;8>u;u++){if(a=s(i)-t,e>z(a))return i;if(o=(3*c*i+2*l)*i+h,1e-6>z(o))break;i-=a/o}if(r=0,n=1,i=t,r>i)return r;if(i>n)return n;for(;n>r;){if(a=s(i),e>z(a-t))return i;t>a?r=i:n=i,i=(n-r)/2+r}return i}var h=3*e,l=3*(n-e)-h,c=1-h-l,f=3*r,p=3*(i-r)-f,d=1-f-p;return o(t,1/(200*a))}function g(t,e){var r=[],n={};if(this.ms=e,this.times=1,t){for(var i in t)t[k](i)&&(n[Q(i)]=t[i],r.push(Q(i)));r.sort(he)}this.anim=n,this.top=r[r.length-1],this.percents=r}function x(e,r,n,i,a,s){n=Q(n);var o,u,h,l,c,p,g=e.ms,x={},v={},m={};if(i)for(_=0,w=ar.length;w>_;_++){var y=ar[_];if(y.el.id==r.id&&y.anim==e){y.percent!=n?(ar.splice(_,1),h=1):u=y,r.attr(y.totalOrigin);break}}else i=+v;for(var _=0,w=e.percents.length;w>_;_++){if(e.percents[_]==n||e.percents[_]>i*e.top){n=e.percents[_],c=e.percents[_-1]||0,g=g/e.top*(n-c),l=e.percents[_+1],o=e.anim[n];break}i&&r.attr(e.anim[e.percents[_]])}if(o){if(u)u.initstatus=i,u.start=new Date-u.ms*i;else{for(var B in o)if(o[k](B)&&(ee[k](B)||r.paper.customAttributes[k](B)))switch(x[B]=r.attr(B),null==x[B]&&(x[B]=te[B]),v[B]=o[B],ee[B]){case G:m[B]=(v[B]-x[B])/g;break;case"colour":x[B]=t.getRGB(x[B]);var S=t.getRGB(v[B]);m[B]={r:(S.r-x[B].r)/g,g:(S.g-x[B].g)/g,b:(S.b-x[B].b)/g};break;case"path":var C=qe(x[B],v[B]),F=C[1];for(x[B]=C[0],m[B]=[],_=0,w=x[B].length;w>_;_++){m[B][_]=[0];for(var L=1,A=x[B][_].length;A>L;L++)m[B][_][L]=(F[_][L]-x[B][_][L])/g}break;case"transform":var M=r._,q=Oe(M[B],v[B]);if(q)for(x[B]=q.from,v[B]=q.to,m[B]=[],m[B].real=!0,_=0,w=x[B].length;w>_;_++)for(m[B][_]=[x[B][_][0]],L=1,A=x[B][_].length;A>L;L++)m[B][_][L]=(v[B][_][L]-x[B][_][L])/g;else{var j=r.matrix||new f,R={_:{transform:M.transform},getBBox:function(){return r.getBBox(1)}};x[B]=[j.a,j.b,j.c,j.d,j.e,j.f],De(R,v[B]),v[B]=R._.transform,m[B]=[(R.matrix.a-j.a)/g,(R.matrix.b-j.b)/g,(R.matrix.c-j.c)/g,(R.matrix.d-j.d)/g,(R.matrix.e-j.e)/g,(R.matrix.f-j.f)/g]}break;case"csv":var D=P(o[B])[E](b),I=P(x[B])[E](b);if("clip-rect"==B)for(x[B]=I,m[B]=[],_=I.length;_--;)m[B][_]=(D[_]-x[B][_])/g;v[B]=D;break;default:for(D=[][T](o[B]),I=[][T](x[B]),m[B]=[],_=r.paper.customAttributes[B].length;_--;)m[B][_]=((D[_]||0)-(I[_]||0))/g}var O=o.easing,z=t.easing_formulas[O];if(!z)if(z=P(O).match($),z&&5==z.length){var V=z;z=function(t){return d(t,+V[1],+V[2],+V[3],+V[4],g)}}else z=ce;if(p=o.start||e.start||+new Date,y={anim:e,percent:n,timestamp:p,start:p+(e.del||0),status:0,initstatus:i||0,stop:!1,ms:g,easing:z,from:x,diff:m,to:v,el:r,callback:o.callback,prev:c,next:l,repeat:s||e.times,origin:r.attr(),totalOrigin:a},ar.push(y),i&&!u&&!h&&(y.stop=!0,y.start=new Date-g*i,1==ar.length))return or();h&&(y.start=new Date-y.ms*i),1==ar.length&&sr(or)}eve("raphael.anim.start."+r.id,r,e)}}function v(t){for(var e=0;ar.length>e;e++)ar[e].el.paper==t&&ar.splice(e--,1)}eve=require("eve"),t.version="2.1.0",t.eve=eve;var m,y,b=/[, ]+/,_={circle:1,rect:1,path:1,ellipse:1,text:1,image:1},w=/\{(\d+)\}/g,k="hasOwnProperty",B={doc:document,win:window},S={was:Object.prototype[k].call(B.win,"Raphael"),is:B.win.Raphael},C=function(){this.ca=this.customAttributes={}},F="apply",T="concat",L="createTouch"in B.doc,A="",M=" ",P=String,E="split",q="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[E](M),j={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},R=P.prototype.toLowerCase,D=Math,I=D.max,O=D.min,z=D.abs,V=D.pow,X=D.PI,G="number",Y="string",N="array",W=Object.prototype.toString,H=(t._ISURL=/^url\(['"]?([^\)]+?)['"]?\)$/i,/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i),U={NaN:1,Infinity:1,"-Infinity":1},$=/^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,Z=D.round,Q=parseFloat,J=parseInt,K=P.prototype.toUpperCase,te=t._availableAttrs={"arrow-end":"none","arrow-start":"none",blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/","letter-spacing":0,opacity:1,path:"M0,0",r:0,rx:0,ry:0,src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",transform:"",width:0,x:0,y:0},ee=t._availableAnimAttrs={blur:G,"clip-rect":"csv",cx:G,cy:G,fill:"colour","fill-opacity":G,"font-size":G,height:G,opacity:G,path:"path",r:G,rx:G,ry:G,stroke:"colour","stroke-opacity":G,"stroke-width":G,transform:"transform",width:G,x:G,y:G},re=/[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,ne={hs:1,rg:1},ie=/,?([achlmqrstvxz]),?/gi,ae=/([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi,se=/([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi,oe=/(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/gi,ue=(t._radial_gradient=/^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,{}),he=function(t,e){return Q(t)-Q(e)},le=function(){},ce=function(t){return t},fe=t._rectPath=function(t,e,r,n,i){return i?[["M",t+i,e],["l",r-2*i,0],["a",i,i,0,0,1,i,i],["l",0,n-2*i],["a",i,i,0,0,1,-i,i],["l",2*i-r,0],["a",i,i,0,0,1,-i,-i],["l",0,2*i-n],["a",i,i,0,0,1,i,-i],["z"]]:[["M",t,e],["l",r,0],["l",0,n],["l",-r,0],["z"]]},pe=function(t,e,r,n){return null==n&&(n=r),[["M",t,e],["m",0,-n],["a",r,n,0,1,1,0,2*n],["a",r,n,0,1,1,0,-2*n],["z"]]},de=t._getPath={path:function(t){return t.attr("path")},circle:function(t){var e=t.attrs;return pe(e.cx,e.cy,e.r)},ellipse:function(t){var e=t.attrs;return pe(e.cx,e.cy,e.rx,e.ry)},rect:function(t){var e=t.attrs;return fe(e.x,e.y,e.width,e.height,e.r)},image:function(t){var e=t.attrs;return fe(e.x,e.y,e.width,e.height)},text:function(t){var e=t._getBBox();return fe(e.x,e.y,e.width,e.height)},set:function(t){var e=t._getBBox();return fe(e.x,e.y,e.width,e.height)}},ge=t.mapPath=function(t,e){if(!e)return t;var r,n,i,a,s,o,u;for(t=qe(t),i=0,s=t.length;s>i;i++)for(u=t[i],a=1,o=u.length;o>a;a+=2)r=e.x(u[a],u[a+1]),n=e.y(u[a],u[a+1]),u[a]=r,u[a+1]=n;return t};if(t._g=B,t.type=B.win.SVGAngle||B.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML","VML"==t.type){var xe,ve=B.doc.createElement("div");if(ve.innerHTML='<v:shape adj="1"/>',xe=ve.firstChild,xe.style.behavior="url(#default#VML)",!xe||"object"!=typeof xe.adj)return t.type=A;ve=null}t.svg=!(t.vml="VML"==t.type),t._Paper=C,t.fn=y=C.prototype=t.prototype,t._id=0,t._oid=0,t.is=function(t,e){return e=R.call(e),"finite"==e?!U[k](+t):"array"==e?t instanceof Array:"null"==e&&null===t||e==typeof t&&null!==t||"object"==e&&t===Object(t)||"array"==e&&Array.isArray&&Array.isArray(t)||W.call(t).slice(8,-1).toLowerCase()==e},t.angle=function(e,r,n,i,a,s){if(null==a){var o=e-n,u=r-i;return o||u?(180+180*D.atan2(-u,-o)/X+360)%360:0}return t.angle(e,r,a,s)-t.angle(n,i,a,s)},t.rad=function(t){return t%360*X/180},t.deg=function(t){return 180*t/X%360},t.snapTo=function(e,r,n){if(n=t.is(n,"finite")?n:10,t.is(e,N)){for(var i=e.length;i--;)if(n>=z(e[i]-r))return e[i]}else{e=+e;var a=r%e;if(n>a)return r-a;if(a>e-n)return r-a+e}return r},t.createUUID=function(t,e){return function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(t,e).toUpperCase()}}(/[xy]/g,function(t){var e=0|16*D.random(),r="x"==t?e:8|3&e;return r.toString(16)}),t.setWindow=function(e){eve("raphael.setWindow",t,B.win,e),B.win=e,B.doc=B.win.document,t._engine.initWin&&t._engine.initWin(B.win)};var me=function(e){if(t.vml){var r,i=/^\s+|\s+$/g;try{var a=new ActiveXObject("htmlfile");a.write("<body>"),a.close(),r=a.body}catch(s){r=createPopup().document.body}var o=r.createTextRange();me=n(function(t){try{r.style.color=P(t).replace(i,A);var e=o.queryCommandValue("ForeColor");return e=(255&e)<<16|65280&e|(16711680&e)>>>16,"#"+("000000"+e.toString(16)).slice(-6)}catch(n){return"none"}})}else{var u=B.doc.createElement("i");u.title="Raphaël Colour Picker",u.style.display="none",B.doc.body.appendChild(u),me=n(function(t){return u.style.color=t,B.doc.defaultView.getComputedStyle(u,A).getPropertyValue("color")})}return me(e)},ye=function(){return"hsb("+[this.h,this.s,this.b]+")"},be=function(){return"hsl("+[this.h,this.s,this.l]+")"},_e=function(){return this.hex},we=function(e,r,n){if(null==r&&t.is(e,"object")&&"r"in e&&"g"in e&&"b"in e&&(n=e.b,r=e.g,e=e.r),null==r&&t.is(e,Y)){var i=t.getRGB(e);e=i.r,r=i.g,n=i.b}return(e>1||r>1||n>1)&&(e/=255,r/=255,n/=255),[e,r,n]},ke=function(e,r,n,i){e*=255,r*=255,n*=255;var a={r:e,g:r,b:n,hex:t.rgb(e,r,n),toString:_e};return t.is(i,"finite")&&(a.opacity=i),a};t.color=function(e){var r;return t.is(e,"object")&&"h"in e&&"s"in e&&"b"in e?(r=t.hsb2rgb(e),e.r=r.r,e.g=r.g,e.b=r.b,e.hex=r.hex):t.is(e,"object")&&"h"in e&&"s"in e&&"l"in e?(r=t.hsl2rgb(e),e.r=r.r,e.g=r.g,e.b=r.b,e.hex=r.hex):(t.is(e,"string")&&(e=t.getRGB(e)),t.is(e,"object")&&"r"in e&&"g"in e&&"b"in e?(r=t.rgb2hsl(e),e.h=r.h,e.s=r.s,e.l=r.l,r=t.rgb2hsb(e),e.v=r.b):(e={hex:"none"},e.r=e.g=e.b=e.h=e.s=e.v=e.l=-1)),e.toString=_e,e},t.hsb2rgb=function(t,e,r,n){this.is(t,"object")&&"h"in t&&"s"in t&&"b"in t&&(r=t.b,e=t.s,t=t.h,n=t.o),t*=360;var i,a,s,o,u;return t=t%360/60,u=r*e,o=u*(1-z(t%2-1)),i=a=s=r-u,t=~~t,i+=[u,o,0,0,o,u][t],a+=[o,u,u,o,0,0][t],s+=[0,0,o,u,u,o][t],ke(i,a,s,n)},t.hsl2rgb=function(t,e,r,n){this.is(t,"object")&&"h"in t&&"s"in t&&"l"in t&&(r=t.l,e=t.s,t=t.h),(t>1||e>1||r>1)&&(t/=360,e/=100,r/=100),t*=360;var i,a,s,o,u;return t=t%360/60,u=2*e*(.5>r?r:1-r),o=u*(1-z(t%2-1)),i=a=s=r-u/2,t=~~t,i+=[u,o,0,0,o,u][t],a+=[o,u,u,o,0,0][t],s+=[0,0,o,u,u,o][t],ke(i,a,s,n)},t.rgb2hsb=function(t,e,r){r=we(t,e,r),t=r[0],e=r[1],r=r[2];var n,i,a,s;return a=I(t,e,r),s=a-O(t,e,r),n=0==s?null:a==t?(e-r)/s:a==e?(r-t)/s+2:(t-e)/s+4,n=60*((n+360)%6)/360,i=0==s?0:s/a,{h:n,s:i,b:a,toString:ye}},t.rgb2hsl=function(t,e,r){r=we(t,e,r),t=r[0],e=r[1],r=r[2];var n,i,a,s,o,u;return s=I(t,e,r),o=O(t,e,r),u=s-o,n=0==u?null:s==t?(e-r)/u:s==e?(r-t)/u+2:(t-e)/u+4,n=60*((n+360)%6)/360,a=(s+o)/2,i=0==u?0:.5>a?u/(2*a):u/(2-2*a),{h:n,s:i,l:a,toString:be}},t._path2string=function(){return this.join(",").replace(ie,"$1")},t._preload=function(t,e){var r=B.doc.createElement("img");r.style.cssText="position:absolute;left:-9999em;top:-9999em",r.onload=function(){e.call(this),this.onload=null,B.doc.body.removeChild(this)},r.onerror=function(){B.doc.body.removeChild(this)},B.doc.body.appendChild(r),r.src=t},t.getRGB=n(function(e){if(!e||(e=P(e)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:i};if("none"==e)return{r:-1,g:-1,b:-1,hex:"none",toString:i};!(ne[k](e.toLowerCase().substring(0,2))||"#"==e.charAt())&&(e=me(e));var r,n,a,s,o,u,h=e.match(H);return h?(h[2]&&(a=J(h[2].substring(5),16),n=J(h[2].substring(3,5),16),r=J(h[2].substring(1,3),16)),h[3]&&(a=J((o=h[3].charAt(3))+o,16),n=J((o=h[3].charAt(2))+o,16),r=J((o=h[3].charAt(1))+o,16)),h[4]&&(u=h[4][E](re),r=Q(u[0]),"%"==u[0].slice(-1)&&(r*=2.55),n=Q(u[1]),"%"==u[1].slice(-1)&&(n*=2.55),a=Q(u[2]),"%"==u[2].slice(-1)&&(a*=2.55),"rgba"==h[1].toLowerCase().slice(0,4)&&(s=Q(u[3])),u[3]&&"%"==u[3].slice(-1)&&(s/=100)),h[5]?(u=h[5][E](re),r=Q(u[0]),"%"==u[0].slice(-1)&&(r*=2.55),n=Q(u[1]),"%"==u[1].slice(-1)&&(n*=2.55),a=Q(u[2]),"%"==u[2].slice(-1)&&(a*=2.55),("deg"==u[0].slice(-3)||"°"==u[0].slice(-1))&&(r/=360),"hsba"==h[1].toLowerCase().slice(0,4)&&(s=Q(u[3])),u[3]&&"%"==u[3].slice(-1)&&(s/=100),t.hsb2rgb(r,n,a,s)):h[6]?(u=h[6][E](re),r=Q(u[0]),"%"==u[0].slice(-1)&&(r*=2.55),n=Q(u[1]),"%"==u[1].slice(-1)&&(n*=2.55),a=Q(u[2]),"%"==u[2].slice(-1)&&(a*=2.55),("deg"==u[0].slice(-3)||"°"==u[0].slice(-1))&&(r/=360),"hsla"==h[1].toLowerCase().slice(0,4)&&(s=Q(u[3])),u[3]&&"%"==u[3].slice(-1)&&(s/=100),t.hsl2rgb(r,n,a,s)):(h={r:r,g:n,b:a,toString:i},h.hex="#"+(16777216|a|n<<8|r<<16).toString(16).slice(1),t.is(s,"finite")&&(h.opacity=s),h)):{r:-1,g:-1,b:-1,hex:"none",error:1,toString:i}},t),t.hsb=n(function(e,r,n){return t.hsb2rgb(e,r,n).hex}),t.hsl=n(function(e,r,n){return t.hsl2rgb(e,r,n).hex}),t.rgb=n(function(t,e,r){return"#"+(16777216|r|e<<8|t<<16).toString(16).slice(1)}),t.getColor=function(t){var e=this.getColor.start=this.getColor.start||{h:0,s:1,b:t||.75},r=this.hsb2rgb(e.h,e.s,e.b);return e.h+=.075,e.h>1&&(e.h=0,e.s-=.2,0>=e.s&&(this.getColor.start={h:0,s:1,b:e.b})),r.hex},t.getColor.reset=function(){delete this.start},t.parsePathString=function(e){if(!e)return null;var r=Be(e);if(r.arr)return Ce(r.arr);var n={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},i=[];return t.is(e,N)&&t.is(e[0],N)&&(i=Ce(e)),i.length||P(e).replace(ae,function(t,e,r){var a=[],s=e.toLowerCase();if(r.replace(oe,function(t,e){e&&a.push(+e)}),"m"==s&&a.length>2&&(i.push([e][T](a.splice(0,2))),s="l",e="m"==e?"l":"L"),"r"==s)i.push([e][T](a));else for(;a.length>=n[s]&&(i.push([e][T](a.splice(0,n[s]))),n[s]););}),i.toString=t._path2string,r.arr=Ce(i),i},t.parseTransformString=n(function(e){if(!e)return null;var r=[];return t.is(e,N)&&t.is(e[0],N)&&(r=Ce(e)),r.length||P(e).replace(se,function(t,e,n){var i=[];R.call(e),n.replace(oe,function(t,e){e&&i.push(+e)}),r.push([e][T](i))}),r.toString=t._path2string,r});var Be=function(t){var e=Be.ps=Be.ps||{};return e[t]?e[t].sleep=100:e[t]={sleep:100},setTimeout(function(){for(var r in e)e[k](r)&&r!=t&&(e[r].sleep--,!e[r].sleep&&delete e[r])}),e[t]};t.findDotsAtSegment=function(t,e,r,n,i,a,s,o,u){var h=1-u,l=V(h,3),c=V(h,2),f=u*u,p=f*u,d=l*t+3*c*u*r+3*h*u*u*i+p*s,g=l*e+3*c*u*n+3*h*u*u*a+p*o,x=t+2*u*(r-t)+f*(i-2*r+t),v=e+2*u*(n-e)+f*(a-2*n+e),m=r+2*u*(i-r)+f*(s-2*i+r),y=n+2*u*(a-n)+f*(o-2*a+n),b=h*t+u*r,_=h*e+u*n,w=h*i+u*s,k=h*a+u*o,B=90-180*D.atan2(x-m,v-y)/X;return(x>m||y>v)&&(B+=180),{x:d,y:g,m:{x:x,y:v},n:{x:m,y:y},start:{x:b,y:_},end:{x:w,y:k},alpha:B}},t.bezierBBox=function(e,r,n,i,a,s,o,u){t.is(e,"array")||(e=[e,r,n,i,a,s,o,u]);var h=Ee.apply(null,e);return{x:h.min.x,y:h.min.y,x2:h.max.x,y2:h.max.y,width:h.max.x-h.min.x,height:h.max.y-h.min.y}},t.isPointInsideBBox=function(t,e,r){return e>=t.x&&t.x2>=e&&r>=t.y&&t.y2>=r},t.isBBoxIntersect=function(e,r){var n=t.isPointInsideBBox;return n(r,e.x,e.y)||n(r,e.x2,e.y)||n(r,e.x,e.y2)||n(r,e.x2,e.y2)||n(e,r.x,r.y)||n(e,r.x2,r.y)||n(e,r.x,r.y2)||n(e,r.x2,r.y2)||(e.x<r.x2&&e.x>r.x||r.x<e.x2&&r.x>e.x)&&(e.y<r.y2&&e.y>r.y||r.y<e.y2&&r.y>e.y)},t.pathIntersection=function(t,e){return c(t,e)},t.pathIntersectionNumber=function(t,e){return c(t,e,1)},t.isPointInsidePath=function(e,r,n){var i=t.pathBBox(e);return t.isPointInsideBBox(i,r,n)&&1==c(e,[["M",r,n],["H",i.x2+10]],1)%2},t._removedFactory=function(t){return function(){eve("raphael.log",null,"Raphaël: you are calling to method “"+t+"” of removed object",t)}};var Se=t.pathBBox=function(t){var r=Be(t);if(r.bbox)return e(r.bbox);if(!t)return{x:0,y:0,width:0,height:0,x2:0,y2:0};t=qe(t);for(var n,i=0,a=0,s=[],o=[],u=0,h=t.length;h>u;u++)if(n=t[u],"M"==n[0])i=n[1],a=n[2],s.push(i),o.push(a);else{var l=Ee(i,a,n[1],n[2],n[3],n[4],n[5],n[6]);s=s[T](l.min.x,l.max.x),o=o[T](l.min.y,l.max.y),i=n[5],a=n[6]}var c=O[F](0,s),f=O[F](0,o),p=I[F](0,s),d=I[F](0,o),g={x:c,y:f,x2:p,y2:d,width:p-c,height:d-f};return r.bbox=e(g),g},Ce=function(r){var n=e(r);return n.toString=t._path2string,n},Fe=t._pathToRelative=function(e){var r=Be(e);if(r.rel)return Ce(r.rel);t.is(e,N)&&t.is(e&&e[0],N)||(e=t.parsePathString(e));var n=[],i=0,a=0,s=0,o=0,u=0;"M"==e[0][0]&&(i=e[0][1],a=e[0][2],s=i,o=a,u++,n.push(["M",i,a]));for(var h=u,l=e.length;l>h;h++){var c=n[h]=[],f=e[h];if(f[0]!=R.call(f[0]))switch(c[0]=R.call(f[0]),c[0]){case"a":c[1]=f[1],c[2]=f[2],c[3]=f[3],c[4]=f[4],c[5]=f[5],c[6]=+(f[6]-i).toFixed(3),c[7]=+(f[7]-a).toFixed(3);break;case"v":c[1]=+(f[1]-a).toFixed(3);break;case"m":s=f[1],o=f[2];default:for(var p=1,d=f.length;d>p;p++)c[p]=+(f[p]-(p%2?i:a)).toFixed(3)}else{c=n[h]=[],"m"==f[0]&&(s=f[1]+i,o=f[2]+a);for(var g=0,x=f.length;x>g;g++)n[h][g]=f[g]}var v=n[h].length;switch(n[h][0]){case"z":i=s,a=o;break;case"h":i+=+n[h][v-1];break;case"v":a+=+n[h][v-1];break;default:i+=+n[h][v-2],a+=+n[h][v-1]}}return n.toString=t._path2string,r.rel=Ce(n),n},Te=t._pathToAbsolute=function(e){var r=Be(e);if(r.abs)return Ce(r.abs);if(t.is(e,N)&&t.is(e&&e[0],N)||(e=t.parsePathString(e)),!e||!e.length)return[["M",0,0]];var n=[],i=0,s=0,o=0,u=0,h=0;"M"==e[0][0]&&(i=+e[0][1],s=+e[0][2],o=i,u=s,h++,n[0]=["M",i,s]);for(var l,c,f=3==e.length&&"M"==e[0][0]&&"R"==e[1][0].toUpperCase()&&"Z"==e[2][0].toUpperCase(),p=h,d=e.length;d>p;p++){if(n.push(l=[]),c=e[p],c[0]!=K.call(c[0]))switch(l[0]=K.call(c[0]),l[0]){case"A":l[1]=c[1],l[2]=c[2],l[3]=c[3],l[4]=c[4],l[5]=c[5],l[6]=+(c[6]+i),l[7]=+(c[7]+s);break;case"V":l[1]=+c[1]+s;break;case"H":l[1]=+c[1]+i;break;case"R":for(var g=[i,s][T](c.slice(1)),x=2,v=g.length;v>x;x++)g[x]=+g[x]+i,g[++x]=+g[x]+s;n.pop(),n=n[T](a(g,f));break;case"M":o=+c[1]+i,u=+c[2]+s;default:for(x=1,v=c.length;v>x;x++)l[x]=+c[x]+(x%2?i:s)}else if("R"==c[0])g=[i,s][T](c.slice(1)),n.pop(),n=n[T](a(g,f)),l=["R"][T](c.slice(-2));else for(var m=0,y=c.length;y>m;m++)l[m]=c[m];switch(l[0]){case"Z":i=o,s=u;break;case"H":i=l[1];break;case"V":s=l[1];break;case"M":o=l[l.length-2],u=l[l.length-1];default:i=l[l.length-2],s=l[l.length-1]}}return n.toString=t._path2string,r.abs=Ce(n),n},Le=function(t,e,r,n){return[t,e,r,n,r,n]},Ae=function(t,e,r,n,i,a){var s=1/3,o=2/3;return[s*t+o*r,s*e+o*n,s*i+o*r,s*a+o*n,i,a]},Me=function(t,e,r,i,a,s,o,u,h,l){var c,f=120*X/180,p=X/180*(+a||0),d=[],g=n(function(t,e,r){var n=t*D.cos(r)-e*D.sin(r),i=t*D.sin(r)+e*D.cos(r);return{x:n,y:i}});if(l)B=l[0],S=l[1],w=l[2],k=l[3];else{c=g(t,e,-p),t=c.x,e=c.y,c=g(u,h,-p),u=c.x,h=c.y;var x=(D.cos(X/180*a),D.sin(X/180*a),(t-u)/2),v=(e-h)/2,m=x*x/(r*r)+v*v/(i*i);m>1&&(m=D.sqrt(m),r=m*r,i=m*i);var y=r*r,b=i*i,_=(s==o?-1:1)*D.sqrt(z((y*b-y*v*v-b*x*x)/(y*v*v+b*x*x))),w=_*r*v/i+(t+u)/2,k=_*-i*x/r+(e+h)/2,B=D.asin(((e-k)/i).toFixed(9)),S=D.asin(((h-k)/i).toFixed(9));B=w>t?X-B:B,S=w>u?X-S:S,0>B&&(B=2*X+B),0>S&&(S=2*X+S),o&&B>S&&(B-=2*X),!o&&S>B&&(S-=2*X)}var C=S-B;if(z(C)>f){var F=S,L=u,A=h;S=B+f*(o&&S>B?1:-1),u=w+r*D.cos(S),h=k+i*D.sin(S),d=Me(u,h,r,i,a,0,o,L,A,[S,F,w,k])}C=S-B;var M=D.cos(B),P=D.sin(B),q=D.cos(S),j=D.sin(S),R=D.tan(C/4),I=4/3*r*R,O=4/3*i*R,V=[t,e],G=[t+I*P,e-O*M],Y=[u+I*j,h-O*q],N=[u,h];if(G[0]=2*V[0]-G[0],G[1]=2*V[1]-G[1],l)return[G,Y,N][T](d);d=[G,Y,N][T](d).join()[E](",");for(var W=[],H=0,U=d.length;U>H;H++)W[H]=H%2?g(d[H-1],d[H],p).y:g(d[H],d[H+1],p).x;return W},Pe=function(t,e,r,n,i,a,s,o,u){var h=1-u;return{x:V(h,3)*t+3*V(h,2)*u*r+3*h*u*u*i+V(u,3)*s,y:V(h,3)*e+3*V(h,2)*u*n+3*h*u*u*a+V(u,3)*o}},Ee=n(function(t,e,r,n,i,a,s,o){var u,h=i-2*r+t-(s-2*i+r),l=2*(r-t)-2*(i-r),c=t-r,f=(-l+D.sqrt(l*l-4*h*c))/2/h,p=(-l-D.sqrt(l*l-4*h*c))/2/h,d=[e,o],g=[t,s];return z(f)>"1e12"&&(f=.5),z(p)>"1e12"&&(p=.5),f>0&&1>f&&(u=Pe(t,e,r,n,i,a,s,o,f),g.push(u.x),d.push(u.y)),p>0&&1>p&&(u=Pe(t,e,r,n,i,a,s,o,p),g.push(u.x),d.push(u.y)),h=a-2*n+e-(o-2*a+n),l=2*(n-e)-2*(a-n),c=e-n,f=(-l+D.sqrt(l*l-4*h*c))/2/h,p=(-l-D.sqrt(l*l-4*h*c))/2/h,z(f)>"1e12"&&(f=.5),z(p)>"1e12"&&(p=.5),f>0&&1>f&&(u=Pe(t,e,r,n,i,a,s,o,f),g.push(u.x),d.push(u.y)),p>0&&1>p&&(u=Pe(t,e,r,n,i,a,s,o,p),g.push(u.x),d.push(u.y)),{min:{x:O[F](0,g),y:O[F](0,d)},max:{x:I[F](0,g),y:I[F](0,d)}}}),qe=t._path2curve=n(function(t,e){var r=!e&&Be(t);if(!e&&r.curve)return Ce(r.curve);for(var n=Te(t),i=e&&Te(e),a={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},s={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},o=(function(t,e){var r,n;if(!t)return["C",e.x,e.y,e.x,e.y,e.x,e.y];switch(!(t[0]in{T:1,Q:1})&&(e.qx=e.qy=null),t[0]){case"M":e.X=t[1],e.Y=t[2];break;case"A":t=["C"][T](Me[F](0,[e.x,e.y][T](t.slice(1))));break;case"S":r=e.x+(e.x-(e.bx||e.x)),n=e.y+(e.y-(e.by||e.y)),t=["C",r,n][T](t.slice(1));break;case"T":e.qx=e.x+(e.x-(e.qx||e.x)),e.qy=e.y+(e.y-(e.qy||e.y)),t=["C"][T](Ae(e.x,e.y,e.qx,e.qy,t[1],t[2]));break;case"Q":e.qx=t[1],e.qy=t[2],t=["C"][T](Ae(e.x,e.y,t[1],t[2],t[3],t[4]));break;case"L":t=["C"][T](Le(e.x,e.y,t[1],t[2]));break;case"H":t=["C"][T](Le(e.x,e.y,t[1],e.y));break;case"V":t=["C"][T](Le(e.x,e.y,e.x,t[1]));break;case"Z":t=["C"][T](Le(e.x,e.y,e.X,e.Y))}return t}),u=function(t,e){if(t[e].length>7){t[e].shift();for(var r=t[e];r.length;)t.splice(e++,0,["C"][T](r.splice(0,6)));t.splice(e,1),c=I(n.length,i&&i.length||0)}},h=function(t,e,r,a,s){t&&e&&"M"==t[s][0]&&"M"!=e[s][0]&&(e.splice(s,0,["M",a.x,a.y]),r.bx=0,r.by=0,r.x=t[s][1],r.y=t[s][2],c=I(n.length,i&&i.length||0))},l=0,c=I(n.length,i&&i.length||0);c>l;l++){n[l]=o(n[l],a),u(n,l),i&&(i[l]=o(i[l],s)),i&&u(i,l),h(n,i,a,s,l),h(i,n,s,a,l);var f=n[l],p=i&&i[l],d=f.length,g=i&&p.length;a.x=f[d-2],a.y=f[d-1],a.bx=Q(f[d-4])||a.x,a.by=Q(f[d-3])||a.y,s.bx=i&&(Q(p[g-4])||s.x),s.by=i&&(Q(p[g-3])||s.y),s.x=i&&p[g-2],s.y=i&&p[g-1]}return i||(r.curve=Ce(n)),i?[n,i]:n},null,Ce),je=(t._parseDots=n(function(e){for(var r=[],n=0,i=e.length;i>n;n++){var a={},s=e[n].match(/^([^:]*):?([\d\.]*)/);if(a.color=t.getRGB(s[1]),a.color.error)return null;a.color=a.color.hex,s[2]&&(a.offset=s[2]+"%"),r.push(a)}for(n=1,i=r.length-1;i>n;n++)if(!r[n].offset){for(var o=Q(r[n-1].offset||0),u=0,h=n+1;i>h;h++)if(r[h].offset){u=r[h].offset;break}u||(u=100,h=i),u=Q(u);for(var l=(u-o)/(h-n+1);h>n;n++)o+=l,r[n].offset=o+"%"}return r}),t._tear=function(t,e){t==e.top&&(e.top=t.prev),t==e.bottom&&(e.bottom=t.next),t.next&&(t.next.prev=t.prev),t.prev&&(t.prev.next=t.next)}),Re=(t._tofront=function(t,e){e.top!==t&&(je(t,e),t.next=null,t.prev=e.top,e.top.next=t,e.top=t)},t._toback=function(t,e){e.bottom!==t&&(je(t,e),t.next=e.bottom,t.prev=null,e.bottom.prev=t,e.bottom=t)},t._insertafter=function(t,e,r){je(t,r),e==r.top&&(r.top=t),e.next&&(e.next.prev=t),t.next=e.next,t.prev=e,e.next=t},t._insertbefore=function(t,e,r){je(t,r),e==r.bottom&&(r.bottom=t),e.prev&&(e.prev.next=t),t.prev=e.prev,e.prev=t,t.next=e},t.toMatrix=function(t,e){var r=Se(t),n={_:{transform:A},getBBox:function(){return r}};return De(n,e),n.matrix}),De=(t.transformPath=function(t,e){return ge(t,Re(t,e))},t._extractTransform=function(e,r){if(null==r)return e._.transform;r=P(r).replace(/\.{3}|\u2026/g,e._.transform||A);var n=t.parseTransformString(r),i=0,a=0,s=0,o=1,u=1,h=e._,l=new f;if(h.transform=n||[],n)for(var c=0,p=n.length;p>c;c++){var d,g,x,v,m,y=n[c],b=y.length,_=P(y[0]).toLowerCase(),w=y[0]!=_,k=w?l.invert():0;"t"==_&&3==b?w?(d=k.x(0,0),g=k.y(0,0),x=k.x(y[1],y[2]),v=k.y(y[1],y[2]),l.translate(x-d,v-g)):l.translate(y[1],y[2]):"r"==_?2==b?(m=m||e.getBBox(1),l.rotate(y[1],m.x+m.width/2,m.y+m.height/2),i+=y[1]):4==b&&(w?(x=k.x(y[2],y[3]),v=k.y(y[2],y[3]),l.rotate(y[1],x,v)):l.rotate(y[1],y[2],y[3]),i+=y[1]):"s"==_?2==b||3==b?(m=m||e.getBBox(1),l.scale(y[1],y[b-1],m.x+m.width/2,m.y+m.height/2),o*=y[1],u*=y[b-1]):5==b&&(w?(x=k.x(y[3],y[4]),v=k.y(y[3],y[4]),l.scale(y[1],y[2],x,v)):l.scale(y[1],y[2],y[3],y[4]),o*=y[1],u*=y[2]):"m"==_&&7==b&&l.add(y[1],y[2],y[3],y[4],y[5],y[6]),h.dirtyT=1,e.matrix=l}e.matrix=l,h.sx=o,h.sy=u,h.deg=i,h.dx=a=l.e,h.dy=s=l.f,1==o&&1==u&&!i&&h.bbox?(h.bbox.x+=+a,h.bbox.y+=+s):h.dirtyT=1}),Ie=function(t){var e=t[0];switch(e.toLowerCase()){case"t":return[e,0,0];case"m":return[e,1,0,0,1,0,0];case"r":return 4==t.length?[e,0,t[2],t[3]]:[e,0];case"s":return 5==t.length?[e,1,1,t[3],t[4]]:3==t.length?[e,1,1]:[e,1]}},Oe=t._equaliseTransform=function(e,r){r=P(r).replace(/\.{3}|\u2026/g,e),e=t.parseTransformString(e)||[],r=t.parseTransformString(r)||[];for(var n,i,a,s,o=I(e.length,r.length),u=[],h=[],l=0;o>l;l++){if(a=e[l]||Ie(r[l]),s=r[l]||Ie(a),a[0]!=s[0]||"r"==a[0].toLowerCase()&&(a[2]!=s[2]||a[3]!=s[3])||"s"==a[0].toLowerCase()&&(a[3]!=s[3]||a[4]!=s[4]))return;for(u[l]=[],h[l]=[],n=0,i=I(a.length,s.length);i>n;n++)n in a&&(u[l][n]=a[n]),n in s&&(h[l][n]=s[n])}return{from:u,to:h}};t._getContainer=function(e,r,n,i){var a;return a=null!=i||t.is(e,"object")?e:B.doc.getElementById(e),null!=a?a.tagName?null==r?{container:a,width:a.style.pixelWidth||a.offsetWidth,height:a.style.pixelHeight||a.offsetHeight}:{container:a,width:r,height:n}:{container:1,x:e,y:r,width:n,height:i}:void 0},t.pathToRelative=Fe,t._engine={},t.path2curve=qe,t.matrix=function(t,e,r,n,i,a){return new f(t,e,r,n,i,a)},function(e){function r(t){return t[0]*t[0]+t[1]*t[1]}function n(t){var e=D.sqrt(r(t));t[0]&&(t[0]/=e),t[1]&&(t[1]/=e)}e.add=function(t,e,r,n,i,a){var s,o,u,h,l=[[],[],[]],c=[[this.a,this.c,this.e],[this.b,this.d,this.f],[0,0,1]],p=[[t,r,i],[e,n,a],[0,0,1]];for(t&&t instanceof f&&(p=[[t.a,t.c,t.e],[t.b,t.d,t.f],[0,0,1]]),s=0;3>s;s++)for(o=0;3>o;o++){for(h=0,u=0;3>u;u++)h+=c[s][u]*p[u][o];l[s][o]=h}this.a=l[0][0],this.b=l[1][0],this.c=l[0][1],this.d=l[1][1],this.e=l[0][2],this.f=l[1][2]},e.invert=function(){var t=this,e=t.a*t.d-t.b*t.c;return new f(t.d/e,-t.b/e,-t.c/e,t.a/e,(t.c*t.f-t.d*t.e)/e,(t.b*t.e-t.a*t.f)/e)},e.clone=function(){return new f(this.a,this.b,this.c,this.d,this.e,this.f)},e.translate=function(t,e){this.add(1,0,0,1,t,e)},e.scale=function(t,e,r,n){null==e&&(e=t),(r||n)&&this.add(1,0,0,1,r,n),this.add(t,0,0,e,0,0),(r||n)&&this.add(1,0,0,1,-r,-n)},e.rotate=function(e,r,n){e=t.rad(e),r=r||0,n=n||0;var i=+D.cos(e).toFixed(9),a=+D.sin(e).toFixed(9);this.add(i,a,-a,i,r,n),this.add(1,0,0,1,-r,-n)},e.x=function(t,e){return t*this.a+e*this.c+this.e},e.y=function(t,e){return t*this.b+e*this.d+this.f},e.get=function(t){return+this[P.fromCharCode(97+t)].toFixed(4)},e.toString=function(){return t.svg?"matrix("+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)].join()+")":[this.get(0),this.get(2),this.get(1),this.get(3),0,0].join()},e.toFilter=function(){return"progid:DXImageTransform.Microsoft.Matrix(M11="+this.get(0)+", M12="+this.get(2)+", M21="+this.get(1)+", M22="+this.get(3)+", Dx="+this.get(4)+", Dy="+this.get(5)+", sizingmethod='auto expand')"},e.offset=function(){return[this.e.toFixed(4),this.f.toFixed(4)]},e.split=function(){var e={};e.dx=this.e,e.dy=this.f;var i=[[this.a,this.c],[this.b,this.d]];e.scalex=D.sqrt(r(i[0])),n(i[0]),e.shear=i[0][0]*i[1][0]+i[0][1]*i[1][1],i[1]=[i[1][0]-i[0][0]*e.shear,i[1][1]-i[0][1]*e.shear],e.scaley=D.sqrt(r(i[1])),n(i[1]),e.shear/=e.scaley;var a=-i[0][1],s=i[1][1];return 0>s?(e.rotate=t.deg(D.acos(s)),0>a&&(e.rotate=360-e.rotate)):e.rotate=t.deg(D.asin(a)),e.isSimple=!(+e.shear.toFixed(9)||e.scalex.toFixed(9)!=e.scaley.toFixed(9)&&e.rotate),e.isSuperSimple=!+e.shear.toFixed(9)&&e.scalex.toFixed(9)==e.scaley.toFixed(9)&&!e.rotate,e.noRotation=!+e.shear.toFixed(9)&&!e.rotate,e
},e.toTransformString=function(t){var e=t||this[E]();return e.isSimple?(e.scalex=+e.scalex.toFixed(4),e.scaley=+e.scaley.toFixed(4),e.rotate=+e.rotate.toFixed(4),(e.dx||e.dy?"t"+[e.dx,e.dy]:A)+(1!=e.scalex||1!=e.scaley?"s"+[e.scalex,e.scaley,0,0]:A)+(e.rotate?"r"+[e.rotate,0,0]:A)):"m"+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)]}}(f.prototype);var ze=navigator.userAgent.match(/Version\/(.*?)\s/)||navigator.userAgent.match(/Chrome\/(\d+)/);y.safari="Apple Computer, Inc."==navigator.vendor&&(ze&&4>ze[1]||"iP"==navigator.platform.slice(0,2))||"Google Inc."==navigator.vendor&&ze&&8>ze[1]?function(){var t=this.rect(-99,-99,this.width+99,this.height+99).attr({stroke:"none"});setTimeout(function(){t.remove()})}:le;for(var Ve=function(){this.returnValue=!1},Xe=function(){return this.originalEvent.preventDefault()},Ge=function(){this.cancelBubble=!0},Ye=function(){return this.originalEvent.stopPropagation()},Ne=function(){return B.doc.addEventListener?function(t,e,r,n){var i=L&&j[e]?j[e]:e,a=function(i){var a=B.doc.documentElement.scrollTop||B.doc.body.scrollTop,s=B.doc.documentElement.scrollLeft||B.doc.body.scrollLeft,o=i.clientX+s,u=i.clientY+a;if(L&&j[k](e))for(var h=0,l=i.targetTouches&&i.targetTouches.length;l>h;h++)if(i.targetTouches[h].target==t){var c=i;i=i.targetTouches[h],i.originalEvent=c,i.preventDefault=Xe,i.stopPropagation=Ye;break}return r.call(n,i,o,u)};return t.addEventListener(i,a,!1),function(){return t.removeEventListener(i,a,!1),!0}}:B.doc.attachEvent?function(t,e,r,n){var i=function(t){t=t||B.win.event;var e=B.doc.documentElement.scrollTop||B.doc.body.scrollTop,i=B.doc.documentElement.scrollLeft||B.doc.body.scrollLeft,a=t.clientX+i,s=t.clientY+e;return t.preventDefault=t.preventDefault||Ve,t.stopPropagation=t.stopPropagation||Ge,r.call(n,t,a,s)};t.attachEvent("on"+e,i);var a=function(){return t.detachEvent("on"+e,i),!0};return a}:void 0}(),We=[],He=function(t){for(var e,r=t.clientX,n=t.clientY,i=B.doc.documentElement.scrollTop||B.doc.body.scrollTop,a=B.doc.documentElement.scrollLeft||B.doc.body.scrollLeft,s=We.length;s--;){if(e=We[s],L){for(var o,u=t.touches.length;u--;)if(o=t.touches[u],o.identifier==e.el._drag.id){r=o.clientX,n=o.clientY,(t.originalEvent?t.originalEvent:t).preventDefault();break}}else t.preventDefault();var h,l=e.el.node,c=l.nextSibling,f=l.parentNode,p=l.style.display;B.win.opera&&f.removeChild(l),l.style.display="none",h=e.el.paper.getElementByPoint(r,n),l.style.display=p,B.win.opera&&(c?f.insertBefore(l,c):f.appendChild(l)),h&&eve("raphael.drag.over."+e.el.id,e.el,h),r+=a,n+=i,eve("raphael.drag.move."+e.el.id,e.move_scope||e.el,r-e.el._drag.x,n-e.el._drag.y,r,n,t)}},Ue=function(e){t.unmousemove(He).unmouseup(Ue);for(var r,n=We.length;n--;)r=We[n],r.el._drag={},eve("raphael.drag.end."+r.el.id,r.end_scope||r.start_scope||r.move_scope||r.el,e);We=[]},$e=t.el={},Ze=q.length;Ze--;)(function(e){t[e]=$e[e]=function(r,n){return t.is(r,"function")&&(this.events=this.events||[],this.events.push({name:e,f:r,unbind:Ne(this.shape||this.node||B.doc,e,r,n||this)})),this},t["un"+e]=$e["un"+e]=function(t){for(var r=this.events||[],n=r.length;n--;)if(r[n].name==e&&r[n].f==t)return r[n].unbind(),r.splice(n,1),!r.length&&delete this.events,this;return this}})(q[Ze]);$e.data=function(e,r){var n=ue[this.id]=ue[this.id]||{};if(1==arguments.length){if(t.is(e,"object")){for(var i in e)e[k](i)&&this.data(i,e[i]);return this}return eve("raphael.data.get."+this.id,this,n[e],e),n[e]}return n[e]=r,eve("raphael.data.set."+this.id,this,r,e),this},$e.removeData=function(t){return null==t?ue[this.id]={}:ue[this.id]&&delete ue[this.id][t],this},$e.getData=function(){return e(ue[this.id]||{})},$e.hover=function(t,e,r,n){return this.mouseover(t,r).mouseout(e,n||r)},$e.unhover=function(t,e){return this.unmouseover(t).unmouseout(e)};var Qe=[];$e.drag=function(e,r,n,i,a,s){function o(o){(o.originalEvent||o).preventDefault();var u=B.doc.documentElement.scrollTop||B.doc.body.scrollTop,h=B.doc.documentElement.scrollLeft||B.doc.body.scrollLeft;this._drag.x=o.clientX+h,this._drag.y=o.clientY+u,this._drag.id=o.identifier,!We.length&&t.mousemove(He).mouseup(Ue),We.push({el:this,move_scope:i,start_scope:a,end_scope:s}),r&&eve.on("raphael.drag.start."+this.id,r),e&&eve.on("raphael.drag.move."+this.id,e),n&&eve.on("raphael.drag.end."+this.id,n),eve("raphael.drag.start."+this.id,a||i||this,o.clientX+h,o.clientY+u,o)}return this._drag={},Qe.push({el:this,start:o}),this.mousedown(o),this},$e.onDragOver=function(t){t?eve.on("raphael.drag.over."+this.id,t):eve.unbind("raphael.drag.over."+this.id)},$e.undrag=function(){for(var e=Qe.length;e--;)Qe[e].el==this&&(this.unmousedown(Qe[e].start),Qe.splice(e,1),eve.unbind("raphael.drag.*."+this.id));!Qe.length&&t.unmousemove(He).unmouseup(Ue),We=[]},y.circle=function(e,r,n){var i=t._engine.circle(this,e||0,r||0,n||0);return this.__set__&&this.__set__.push(i),i},y.rect=function(e,r,n,i,a){var s=t._engine.rect(this,e||0,r||0,n||0,i||0,a||0);return this.__set__&&this.__set__.push(s),s},y.ellipse=function(e,r,n,i){var a=t._engine.ellipse(this,e||0,r||0,n||0,i||0);return this.__set__&&this.__set__.push(a),a},y.path=function(e){e&&!t.is(e,Y)&&!t.is(e[0],N)&&(e+=A);var r=t._engine.path(t.format[F](t,arguments),this);return this.__set__&&this.__set__.push(r),r},y.image=function(e,r,n,i,a){var s=t._engine.image(this,e||"about:blank",r||0,n||0,i||0,a||0);return this.__set__&&this.__set__.push(s),s},y.text=function(e,r,n){var i=t._engine.text(this,e||0,r||0,P(n));return this.__set__&&this.__set__.push(i),i},y.set=function(e){!t.is(e,"array")&&(e=Array.prototype.splice.call(arguments,0,arguments.length));var r=new hr(e);return this.__set__&&this.__set__.push(r),r.paper=this,r.type="set",r},y.setStart=function(t){this.__set__=t||this.set()},y.setFinish=function(){var t=this.__set__;return delete this.__set__,t},y.setSize=function(e,r){return t._engine.setSize.call(this,e,r)},y.setViewBox=function(e,r,n,i,a){return t._engine.setViewBox.call(this,e,r,n,i,a)},y.top=y.bottom=null,y.raphael=t;var Je=function(t){var e=t.getBoundingClientRect(),r=t.ownerDocument,n=r.body,i=r.documentElement,a=i.clientTop||n.clientTop||0,s=i.clientLeft||n.clientLeft||0,o=e.top+(B.win.pageYOffset||i.scrollTop||n.scrollTop)-a,u=e.left+(B.win.pageXOffset||i.scrollLeft||n.scrollLeft)-s;return{y:o,x:u}};y.getElementByPoint=function(t,e){var r=this,n=r.canvas,i=B.doc.elementFromPoint(t,e);if(B.win.opera&&"svg"==i.tagName){var a=Je(n),s=n.createSVGRect();s.x=t-a.x,s.y=e-a.y,s.width=s.height=1;var o=n.getIntersectionList(s,null);o.length&&(i=o[o.length-1])}if(!i)return null;for(;i.parentNode&&i!=n.parentNode&&!i.raphael;)i=i.parentNode;return i==r.canvas.parentNode&&(i=n),i=i&&i.raphael?r.getById(i.raphaelid):null},y.getElementsByBBox=function(e){var r=this.set();return this.forEach(function(n){t.isBBoxIntersect(n.getBBox(),e)&&r.push(n)}),r},y.getById=function(t){for(var e=this.bottom;e;){if(e.id==t)return e;e=e.next}return null},y.forEach=function(t,e){for(var r=this.bottom;r;){if(t.call(e,r)===!1)return this;r=r.next}return this},y.getElementsByPoint=function(t,e){var r=this.set();return this.forEach(function(n){n.isPointInside(t,e)&&r.push(n)}),r},$e.isPointInside=function(e,r){var n=this.realPath=this.realPath||de[this.type](this);return t.isPointInsidePath(n,e,r)},$e.getBBox=function(t){if(this.removed)return{};var e=this._;return t?((e.dirty||!e.bboxwt)&&(this.realPath=de[this.type](this),e.bboxwt=Se(this.realPath),e.bboxwt.toString=p,e.dirty=0),e.bboxwt):((e.dirty||e.dirtyT||!e.bbox)&&((e.dirty||!this.realPath)&&(e.bboxwt=0,this.realPath=de[this.type](this)),e.bbox=Se(ge(this.realPath,this.matrix)),e.bbox.toString=p,e.dirty=e.dirtyT=0),e.bbox)},$e.clone=function(){if(this.removed)return null;var t=this.paper[this.type]().attr(this.attr());return this.__set__&&this.__set__.push(t),t},$e.glow=function(t){if("text"==this.type)return null;t=t||{};var e={width:(t.width||10)+(+this.attr("stroke-width")||1),fill:t.fill||!1,opacity:t.opacity||.5,offsetx:t.offsetx||0,offsety:t.offsety||0,color:t.color||"#000"},r=e.width/2,n=this.paper,i=n.set(),a=this.realPath||de[this.type](this);a=this.matrix?ge(a,this.matrix):a;for(var s=1;r+1>s;s++)i.push(n.path(a).attr({stroke:e.color,fill:e.fill?e.color:"none","stroke-linejoin":"round","stroke-linecap":"round","stroke-width":+(e.width/r*s).toFixed(3),opacity:+(e.opacity/r).toFixed(3)}));return i.insertBefore(this).translate(e.offsetx,e.offsety)};var Ke=function(e,r,n,i,a,s,h,l,c){return null==c?o(e,r,n,i,a,s,h,l):t.findDotsAtSegment(e,r,n,i,a,s,h,l,u(e,r,n,i,a,s,h,l,c))},tr=function(e,r){return function(n,i,a){n=qe(n);for(var s,o,u,h,l,c="",f={},p=0,d=0,g=n.length;g>d;d++){if(u=n[d],"M"==u[0])s=+u[1],o=+u[2];else{if(h=Ke(s,o,u[1],u[2],u[3],u[4],u[5],u[6]),p+h>i){if(r&&!f.start){if(l=Ke(s,o,u[1],u[2],u[3],u[4],u[5],u[6],i-p),c+=["C"+l.start.x,l.start.y,l.m.x,l.m.y,l.x,l.y],a)return c;f.start=c,c=["M"+l.x,l.y+"C"+l.n.x,l.n.y,l.end.x,l.end.y,u[5],u[6]].join(),p+=h,s=+u[5],o=+u[6];continue}if(!e&&!r)return l=Ke(s,o,u[1],u[2],u[3],u[4],u[5],u[6],i-p),{x:l.x,y:l.y,alpha:l.alpha}}p+=h,s=+u[5],o=+u[6]}c+=u.shift()+u}return f.end=c,l=e?p:r?f:t.findDotsAtSegment(s,o,u[0],u[1],u[2],u[3],u[4],u[5],1),l.alpha&&(l={x:l.x,y:l.y,alpha:l.alpha}),l}},er=tr(1),rr=tr(),nr=tr(0,1);t.getTotalLength=er,t.getPointAtLength=rr,t.getSubpath=function(t,e,r){if(1e-6>this.getTotalLength(t)-r)return nr(t,e).end;var n=nr(t,r,1);return e?nr(n,e).end:n},$e.getTotalLength=function(){return"path"==this.type?this.node.getTotalLength?this.node.getTotalLength():er(this.attrs.path):void 0},$e.getPointAtLength=function(t){return"path"==this.type?rr(this.attrs.path,t):void 0},$e.getSubpath=function(e,r){return"path"==this.type?t.getSubpath(this.attrs.path,e,r):void 0};var ir=t.easing_formulas={linear:function(t){return t},"<":function(t){return V(t,1.7)},">":function(t){return V(t,.48)},"<>":function(t){var e=.48-t/1.04,r=D.sqrt(.1734+e*e),n=r-e,i=V(z(n),1/3)*(0>n?-1:1),a=-r-e,s=V(z(a),1/3)*(0>a?-1:1),o=i+s+.5;return 3*(1-o)*o*o+o*o*o},backIn:function(t){var e=1.70158;return t*t*((e+1)*t-e)},backOut:function(t){t-=1;var e=1.70158;return t*t*((e+1)*t+e)+1},elastic:function(t){return t==!!t?t:V(2,-10*t)*D.sin((t-.075)*2*X/.3)+1},bounce:function(t){var e,r=7.5625,n=2.75;return 1/n>t?e=r*t*t:2/n>t?(t-=1.5/n,e=r*t*t+.75):2.5/n>t?(t-=2.25/n,e=r*t*t+.9375):(t-=2.625/n,e=r*t*t+.984375),e}};ir.easeIn=ir["ease-in"]=ir["<"],ir.easeOut=ir["ease-out"]=ir[">"],ir.easeInOut=ir["ease-in-out"]=ir["<>"],ir["back-in"]=ir.backIn,ir["back-out"]=ir.backOut;var ar=[],sr=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){setTimeout(t,16)},or=function(){for(var e=+new Date,r=0;ar.length>r;r++){var n=ar[r];if(!n.el.removed&&!n.paused){var i,a,s=e-n.start,o=n.ms,u=n.easing,h=n.from,l=n.diff,c=n.to,f=(n.t,n.el),p={},d={};if(n.initstatus?(s=(n.initstatus*n.anim.top-n.prev)/(n.percent-n.prev)*o,n.status=n.initstatus,delete n.initstatus,n.stop&&ar.splice(r--,1)):n.status=(n.prev+(n.percent-n.prev)*(s/o))/n.anim.top,!(0>s))if(o>s){var g=u(s/o);for(var v in h)if(h[k](v)){switch(ee[v]){case G:i=+h[v]+g*o*l[v];break;case"colour":i="rgb("+[ur(Z(h[v].r+g*o*l[v].r)),ur(Z(h[v].g+g*o*l[v].g)),ur(Z(h[v].b+g*o*l[v].b))].join(",")+")";break;case"path":i=[];for(var m=0,y=h[v].length;y>m;m++){i[m]=[h[v][m][0]];for(var b=1,_=h[v][m].length;_>b;b++)i[m][b]=+h[v][m][b]+g*o*l[v][m][b];i[m]=i[m].join(M)}i=i.join(M);break;case"transform":if(l[v].real)for(i=[],m=0,y=h[v].length;y>m;m++)for(i[m]=[h[v][m][0]],b=1,_=h[v][m].length;_>b;b++)i[m][b]=h[v][m][b]+g*o*l[v][m][b];else{var w=function(t){return+h[v][t]+g*o*l[v][t]};i=[["m",w(0),w(1),w(2),w(3),w(4),w(5)]]}break;case"csv":if("clip-rect"==v)for(i=[],m=4;m--;)i[m]=+h[v][m]+g*o*l[v][m];break;default:var B=[][T](h[v]);for(i=[],m=f.paper.customAttributes[v].length;m--;)i[m]=+B[m]+g*o*l[v][m]}p[v]=i}f.attr(p),function(t,e,r){setTimeout(function(){eve("raphael.anim.frame."+t,e,r)})}(f.id,f,n.anim)}else{if(function(e,r,n){setTimeout(function(){eve("raphael.anim.frame."+r.id,r,n),eve("raphael.anim.finish."+r.id,r,n),t.is(e,"function")&&e.call(r)})}(n.callback,f,n.anim),f.attr(c),ar.splice(r--,1),n.repeat>1&&!n.next){for(a in c)c[k](a)&&(d[a]=n.totalOrigin[a]);n.el.attr(d),x(n.anim,n.el,n.anim.percents[0],null,n.totalOrigin,n.repeat-1)}n.next&&!n.stop&&x(n.anim,n.el,n.next,null,n.totalOrigin,n.repeat)}}}t.svg&&f&&f.paper&&f.paper.safari(),ar.length&&sr(or)},ur=function(t){return t>255?255:0>t?0:t};$e.animateWith=function(e,r,n,i,a,s){var o=this;if(o.removed)return s&&s.call(o),o;var u=n instanceof g?n:t.animation(n,i,a,s);x(u,o,u.percents[0],null,o.attr());for(var h=0,l=ar.length;l>h;h++)if(ar[h].anim==r&&ar[h].el==e){ar[l-1].start=ar[h].start;break}return o},$e.onAnimation=function(t){return t?eve.on("raphael.anim.frame."+this.id,t):eve.unbind("raphael.anim.frame."+this.id),this},g.prototype.delay=function(t){var e=new g(this.anim,this.ms);return e.times=this.times,e.del=+t||0,e},g.prototype.repeat=function(t){var e=new g(this.anim,this.ms);return e.del=this.del,e.times=D.floor(I(t,0))||1,e},t.animation=function(e,r,n,i){if(e instanceof g)return e;(t.is(n,"function")||!n)&&(i=i||n||null,n=null),e=Object(e),r=+r||0;var a,s,o={};for(s in e)e[k](s)&&Q(s)!=s&&Q(s)+"%"!=s&&(a=!0,o[s]=e[s]);return a?(n&&(o.easing=n),i&&(o.callback=i),new g({100:o},r)):new g(e,r)},$e.animate=function(e,r,n,i){var a=this;if(a.removed)return i&&i.call(a),a;var s=e instanceof g?e:t.animation(e,r,n,i);return x(s,a,s.percents[0],null,a.attr()),a},$e.setTime=function(t,e){return t&&null!=e&&this.status(t,O(e,t.ms)/t.ms),this},$e.status=function(t,e){var r,n,i=[],a=0;if(null!=e)return x(t,this,-1,O(e,1)),this;for(r=ar.length;r>a;a++)if(n=ar[a],n.el.id==this.id&&(!t||n.anim==t)){if(t)return n.status;i.push({anim:n.anim,status:n.status})}return t?0:i},$e.pause=function(t){for(var e=0;ar.length>e;e++)ar[e].el.id!=this.id||t&&ar[e].anim!=t||eve("raphael.anim.pause."+this.id,this,ar[e].anim)!==!1&&(ar[e].paused=!0);return this},$e.resume=function(t){for(var e=0;ar.length>e;e++)if(ar[e].el.id==this.id&&(!t||ar[e].anim==t)){var r=ar[e];eve("raphael.anim.resume."+this.id,this,r.anim)!==!1&&(delete r.paused,this.status(r.anim,r.status))}return this},$e.stop=function(t){for(var e=0;ar.length>e;e++)ar[e].el.id!=this.id||t&&ar[e].anim!=t||eve("raphael.anim.stop."+this.id,this,ar[e].anim)!==!1&&ar.splice(e--,1);return this},eve.on("raphael.remove",v),eve.on("raphael.clear",v),$e.toString=function(){return"Raphaël’s object"};var hr=function(t){if(this.items=[],this.length=0,this.type="set",t)for(var e=0,r=t.length;r>e;e++)!t[e]||t[e].constructor!=$e.constructor&&t[e].constructor!=hr||(this[this.items.length]=this.items[this.items.length]=t[e],this.length++)},lr=hr.prototype;lr.push=function(){for(var t,e,r=0,n=arguments.length;n>r;r++)t=arguments[r],!t||t.constructor!=$e.constructor&&t.constructor!=hr||(e=this.items.length,this[e]=this.items[e]=t,this.length++);return this},lr.pop=function(){return this.length&&delete this[this.length--],this.items.pop()},lr.forEach=function(t,e){for(var r=0,n=this.items.length;n>r;r++)if(t.call(e,this.items[r],r)===!1)return this;return this};for(var cr in $e)$e[k](cr)&&(lr[cr]=function(t){return function(){var e=arguments;return this.forEach(function(r){r[t][F](r,e)})}}(cr));lr.attr=function(e,r){if(e&&t.is(e,N)&&t.is(e[0],"object"))for(var n=0,i=e.length;i>n;n++)this.items[n].attr(e[n]);else for(var a=0,s=this.items.length;s>a;a++)this.items[a].attr(e,r);return this},lr.clear=function(){for(;this.length;)this.pop()},lr.splice=function(t,e){t=0>t?I(this.length+t,0):t,e=I(0,O(this.length-t,e));var r,n=[],i=[],a=[];for(r=2;arguments.length>r;r++)a.push(arguments[r]);for(r=0;e>r;r++)i.push(this[t+r]);for(;this.length-t>r;r++)n.push(this[t+r]);var s=a.length;for(r=0;s+n.length>r;r++)this.items[t+r]=this[t+r]=s>r?a[r]:n[r-s];for(r=this.items.length=this.length-=e-s;this[r];)delete this[r++];return new hr(i)},lr.exclude=function(t){for(var e=0,r=this.length;r>e;e++)if(this[e]==t)return this.splice(e,1),!0},lr.animate=function(e,r,n,i){(t.is(n,"function")||!n)&&(i=n||null);var a,s,o=this.items.length,u=o,h=this;if(!o)return this;i&&(s=function(){!--o&&i.call(h)}),n=t.is(n,Y)?n:s;var l=t.animation(e,r,n,s);for(a=this.items[--u].animate(l);u--;)this.items[u]&&!this.items[u].removed&&this.items[u].animateWith(a,l,l);return this},lr.insertAfter=function(t){for(var e=this.items.length;e--;)this.items[e].insertAfter(t);return this},lr.getBBox=function(){for(var t=[],e=[],r=[],n=[],i=this.items.length;i--;)if(!this.items[i].removed){var a=this.items[i].getBBox();t.push(a.x),e.push(a.y),r.push(a.x+a.width),n.push(a.y+a.height)}return t=O[F](0,t),e=O[F](0,e),r=I[F](0,r),n=I[F](0,n),{x:t,y:e,x2:r,y2:n,width:r-t,height:n-e}},lr.clone=function(t){t=this.paper.set();for(var e=0,r=this.items.length;r>e;e++)t.push(this.items[e].clone());return t},lr.toString=function(){return"Raphaël‘s set"},lr.glow=function(t){var e=this.paper.set();return this.forEach(function(r){var n=r.glow(t);null!=n&&n.forEach(function(t){e.push(t)})}),e},t.registerFont=function(t){if(!t.face)return t;this.fonts=this.fonts||{};var e={w:t.w,face:{},glyphs:{}},r=t.face["font-family"];for(var n in t.face)t.face[k](n)&&(e.face[n]=t.face[n]);if(this.fonts[r]?this.fonts[r].push(e):this.fonts[r]=[e],!t.svg){e.face["units-per-em"]=J(t.face["units-per-em"],10);for(var i in t.glyphs)if(t.glyphs[k](i)){var a=t.glyphs[i];if(e.glyphs[i]={w:a.w,k:{},d:a.d&&"M"+a.d.replace(/[mlcxtrv]/g,function(t){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[t]||"M"})+"z"},a.k)for(var s in a.k)a[k](s)&&(e.glyphs[i].k[s]=a.k[s])}}return t},y.getFont=function(e,r,n,i){if(i=i||"normal",n=n||"normal",r=+r||{normal:400,bold:700,lighter:300,bolder:800}[r]||400,t.fonts){var a=t.fonts[e];if(!a){var s=RegExp("(^|\\s)"+e.replace(/[^\w\d\s+!~.:_-]/g,A)+"(\\s|$)","i");for(var o in t.fonts)if(t.fonts[k](o)&&s.test(o)){a=t.fonts[o];break}}var u;if(a)for(var h=0,l=a.length;l>h&&(u=a[h],u.face["font-weight"]!=r||u.face["font-style"]!=n&&u.face["font-style"]||u.face["font-stretch"]!=i);h++);return u}},y.print=function(e,r,n,i,a,s,o){s=s||"middle",o=I(O(o||0,1),-1);var u,h=P(n)[E](A),l=0,c=0,f=A;if(t.is(i,n)&&(i=this.getFont(i)),i){u=(a||16)/i.face["units-per-em"];for(var p=i.face.bbox[E](b),d=+p[0],g=p[3]-p[1],x=0,v=+p[1]+("baseline"==s?g+ +i.face.descent:g/2),m=0,y=h.length;y>m;m++){if("\n"==h[m])l=0,w=0,c=0,x+=g;else{var _=c&&i.glyphs[h[m-1]]||{},w=i.glyphs[h[m]];l+=c?(_.w||i.w)+(_.k&&_.k[h[m]]||0)+i.w*o:0,c=1}w&&w.d&&(f+=t.transformPath(w.d,["t",l*u,x*u,"s",u,u,d,v,"t",(e-d)/u,(r-v)/u]))}}return this.path(f).attr({fill:"#000",stroke:"none"})},y.add=function(e){if(t.is(e,"array"))for(var r,n=this.set(),i=0,a=e.length;a>i;i++)r=e[i]||{},_[k](r.type)&&n.push(this[r.type]().attr(r));return n},t.format=function(e,r){var n=t.is(r,N)?[0][T](r):arguments;return e&&t.is(e,Y)&&n.length-1&&(e=e.replace(w,function(t,e){return null==n[++e]?A:n[e]})),e||A},t.fullfill=function(){var t=/\{([^\}]+)\}/g,e=/(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,r=function(t,r,n){var i=n;return r.replace(e,function(t,e,r,n,a){e=e||n,i&&(e in i&&(i=i[e]),"function"==typeof i&&a&&(i=i()))}),i=(null==i||i==n?t:i)+""};return function(e,n){return(e+"").replace(t,function(t,e){return r(t,e,n)})}}(),t.ninja=function(){return S.was?B.win.Raphael=S.is:delete Raphael,t},t.st=lr,function(e,r,n){function i(){/in/.test(e.readyState)?setTimeout(i,9):t.eve("raphael.DOMload")}null==e.readyState&&e.addEventListener&&(e.addEventListener(r,n=function(){e.removeEventListener(r,n,!1),e.readyState="complete"},!1),e.readyState="loading"),i()}(document,"DOMContentLoaded"),S.was?B.win.Raphael=t:Raphael=t,eve.on("raphael.DOMload",function(){m=!0}),module.exports=t})();window.Raphael&&window.Raphael.svg&&function(t){var e="hasOwnProperty",r=String,i=parseFloat,n=parseInt,a=Math,s=a.max,o=a.abs,u=a.pow,h=/[, ]+/,l=t.eve,c="",f=" ",d="http://www.w3.org/1999/xlink",p={block:"M5,0 0,2.5 5,5z",classic:"M5,0 0,2.5 5,5 3.5,3 3.5,2z",diamond:"M2.5,0 5,2.5 2.5,5 0,2.5z",open:"M6,1 1,3.5 6,6",oval:"M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"},g={};t.toString=function(){return"Your browser supports SVG.\nYou are running Raphaël "+this.version};var v=function(i,n){if(n){"string"==typeof i&&(i=v(i));for(var a in n)n[e](a)&&("xlink:"==a.substring(0,6)?i.setAttributeNS(d,a.substring(6),r(n[a])):i.setAttribute(a,r(n[a])))}else i=t._g.doc.createElementNS("http://www.w3.org/2000/svg",i),i.style&&(i.style.webkitTapHighlightColor="rgba(0,0,0,0)");return i},x=function(e,n){var h="linear",l=e.id+n,f=.5,d=.5,p=e.node,g=e.paper,x=p.style,y=t._g.doc.getElementById(l);if(!y){if(n=r(n).replace(t._radial_gradient,function(t,e,r){if(h="radial",e&&r){f=i(e),d=i(r);var n=2*(d>.5)-1;u(f-.5,2)+u(d-.5,2)>.25&&(d=a.sqrt(.25-u(f-.5,2))*n+.5)&&.5!=d&&(d=d.toFixed(5)-1e-5*n)}return c}),n=n.split(/\s*\-\s*/),"linear"==h){var m=n.shift();if(m=-i(m),isNaN(m))return null;var b=[0,0,a.cos(t.rad(m)),a.sin(t.rad(m))],_=1/(s(o(b[2]),o(b[3]))||1);b[2]*=_,b[3]*=_,0>b[2]&&(b[0]=-b[2],b[2]=0),0>b[3]&&(b[1]=-b[3],b[3]=0)}var w=t._parseDots(n);if(!w)return null;if(l=l.replace(/[\(\)\s,\xb0#]/g,"_"),e.gradient&&l!=e.gradient.id&&(g.defs.removeChild(e.gradient),delete e.gradient),!e.gradient){y=v(h+"Gradient",{id:l}),e.gradient=y,v(y,"radial"==h?{fx:f,fy:d}:{x1:b[0],y1:b[1],x2:b[2],y2:b[3],gradientTransform:e.matrix.invert()}),g.defs.appendChild(y);for(var k=0,C=w.length;C>k;k++)y.appendChild(v("stop",{offset:w[k].offset?w[k].offset:k?"100%":"0%","stop-color":w[k].color||"#fff"}))}}return v(p,{fill:"url(#"+l+")",opacity:1,"fill-opacity":1}),x.fill=c,x.opacity=1,x.fillOpacity=1,1},y=function(t){var e=t.getBBox(1);v(t.pattern,{patternTransform:t.matrix.invert()+" translate("+e.x+","+e.y+")"})},m=function(i,n,a){if("path"==i.type){for(var s,o,u,h,l,f=r(n).toLowerCase().split("-"),d=i.paper,x=a?"end":"start",y=i.node,m=i.attrs,b=m["stroke-width"],_=f.length,w="classic",k=3,C=3,B=5;_--;)switch(f[_]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":w=f[_];break;case"wide":C=5;break;case"narrow":C=2;break;case"long":k=5;break;case"short":k=2}if("open"==w?(k+=2,C+=2,B+=2,u=1,h=a?4:1,l={fill:"none",stroke:m.stroke}):(h=u=k/2,l={fill:m.stroke,stroke:"none"}),i._.arrows?a?(i._.arrows.endPath&&g[i._.arrows.endPath]--,i._.arrows.endMarker&&g[i._.arrows.endMarker]--):(i._.arrows.startPath&&g[i._.arrows.startPath]--,i._.arrows.startMarker&&g[i._.arrows.startMarker]--):i._.arrows={},"none"!=w){var S="raphael-marker-"+w,A="raphael-marker-"+x+w+k+C;t._g.doc.getElementById(S)?g[S]++:(d.defs.appendChild(v(v("path"),{"stroke-linecap":"round",d:p[w],id:S})),g[S]=1);var T,M=t._g.doc.getElementById(A);M?(g[A]++,T=M.getElementsByTagName("use")[0]):(M=v(v("marker"),{id:A,markerHeight:C,markerWidth:k,orient:"auto",refX:h,refY:C/2}),T=v(v("use"),{"xlink:href":"#"+S,transform:(a?"rotate(180 "+k/2+" "+C/2+") ":c)+"scale("+k/B+","+C/B+")","stroke-width":(1/((k/B+C/B)/2)).toFixed(4)}),M.appendChild(T),d.defs.appendChild(M),g[A]=1),v(T,l);var F=u*("diamond"!=w&&"oval"!=w);a?(s=i._.arrows.startdx*b||0,o=t.getTotalLength(m.path)-F*b):(s=F*b,o=t.getTotalLength(m.path)-(i._.arrows.enddx*b||0)),l={},l["marker-"+x]="url(#"+A+")",(o||s)&&(l.d=Raphael.getSubpath(m.path,s,o)),v(y,l),i._.arrows[x+"Path"]=S,i._.arrows[x+"Marker"]=A,i._.arrows[x+"dx"]=F,i._.arrows[x+"Type"]=w,i._.arrows[x+"String"]=n}else a?(s=i._.arrows.startdx*b||0,o=t.getTotalLength(m.path)-s):(s=0,o=t.getTotalLength(m.path)-(i._.arrows.enddx*b||0)),i._.arrows[x+"Path"]&&v(y,{d:Raphael.getSubpath(m.path,s,o)}),delete i._.arrows[x+"Path"],delete i._.arrows[x+"Marker"],delete i._.arrows[x+"dx"],delete i._.arrows[x+"Type"],delete i._.arrows[x+"String"];for(l in g)if(g[e](l)&&!g[l]){var L=t._g.doc.getElementById(l);L&&L.parentNode.removeChild(L)}}},b={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},_=function(t,e,i){if(e=b[r(e).toLowerCase()]){for(var n=t.attrs["stroke-width"]||"1",a={round:n,square:n,butt:0}[t.attrs["stroke-linecap"]||i["stroke-linecap"]]||0,s=[],o=e.length;o--;)s[o]=e[o]*n+(o%2?1:-1)*a;v(t.node,{"stroke-dasharray":s.join(",")})}},w=function(i,a){var u=i.node,l=i.attrs,f=u.style.visibility;u.style.visibility="hidden";for(var p in a)if(a[e](p)){if(!t._availableAttrs[e](p))continue;var g=a[p];switch(l[p]=g,p){case"blur":i.blur(g);break;case"href":case"title":case"target":var b=u.parentNode;if("a"!=b.tagName.toLowerCase()){var w=v("a");b.insertBefore(w,u),w.appendChild(u),b=w}"target"==p?b.setAttributeNS(d,"show","blank"==g?"new":g):b.setAttributeNS(d,p,g);break;case"cursor":u.style.cursor=g;break;case"transform":i.transform(g);break;case"arrow-start":m(i,g);break;case"arrow-end":m(i,g,1);break;case"clip-rect":var k=r(g).split(h);if(4==k.length){i.clip&&i.clip.parentNode.parentNode.removeChild(i.clip.parentNode);var B=v("clipPath"),S=v("rect");B.id=t.createUUID(),v(S,{x:k[0],y:k[1],width:k[2],height:k[3]}),B.appendChild(S),i.paper.defs.appendChild(B),v(u,{"clip-path":"url(#"+B.id+")"}),i.clip=S}if(!g){var A=u.getAttribute("clip-path");if(A){var T=t._g.doc.getElementById(A.replace(/(^url\(#|\)$)/g,c));T&&T.parentNode.removeChild(T),v(u,{"clip-path":c}),delete i.clip}}break;case"path":"path"==i.type&&(v(u,{d:g?l.path=t._pathToAbsolute(g):"M0,0"}),i._.dirty=1,i._.arrows&&("startString"in i._.arrows&&m(i,i._.arrows.startString),"endString"in i._.arrows&&m(i,i._.arrows.endString,1)));break;case"width":if(u.setAttribute(p,g),i._.dirty=1,!l.fx)break;p="x",g=l.x;case"x":l.fx&&(g=-l.x-(l.width||0));case"rx":if("rx"==p&&"rect"==i.type)break;case"cx":u.setAttribute(p,g),i.pattern&&y(i),i._.dirty=1;break;case"height":if(u.setAttribute(p,g),i._.dirty=1,!l.fy)break;p="y",g=l.y;case"y":l.fy&&(g=-l.y-(l.height||0));case"ry":if("ry"==p&&"rect"==i.type)break;case"cy":u.setAttribute(p,g),i.pattern&&y(i),i._.dirty=1;break;case"r":"rect"==i.type?v(u,{rx:g,ry:g}):u.setAttribute(p,g),i._.dirty=1;break;case"src":"image"==i.type&&u.setAttributeNS(d,"href",g);break;case"stroke-width":(1!=i._.sx||1!=i._.sy)&&(g/=s(o(i._.sx),o(i._.sy))||1),i.paper._vbSize&&(g*=i.paper._vbSize),u.setAttribute(p,g),l["stroke-dasharray"]&&_(i,l["stroke-dasharray"],a),i._.arrows&&("startString"in i._.arrows&&m(i,i._.arrows.startString),"endString"in i._.arrows&&m(i,i._.arrows.endString,1));break;case"stroke-dasharray":_(i,g,a);break;case"fill":var M=r(g).match(t._ISURL);if(M){B=v("pattern");var F=v("image");B.id=t.createUUID(),v(B,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1}),v(F,{x:0,y:0,"xlink:href":M[1]}),B.appendChild(F),function(e){t._preload(M[1],function(){var t=this.offsetWidth,r=this.offsetHeight;v(e,{width:t,height:r}),v(F,{width:t,height:r}),i.paper.safari()})}(B),i.paper.defs.appendChild(B),v(u,{fill:"url(#"+B.id+")"}),i.pattern=B,i.pattern&&y(i);break}var L=t.getRGB(g);if(L.error){if(("circle"==i.type||"ellipse"==i.type||"r"!=r(g).charAt())&&x(i,g)){if("opacity"in l||"fill-opacity"in l){var N=t._g.doc.getElementById(u.getAttribute("fill").replace(/^url\(#|\)$/g,c));if(N){var P=N.getElementsByTagName("stop");v(P[P.length-1],{"stop-opacity":("opacity"in l?l.opacity:1)*("fill-opacity"in l?l["fill-opacity"]:1)})}}l.gradient=g,l.fill="none";break}}else delete a.gradient,delete l.gradient,!t.is(l.opacity,"undefined")&&t.is(a.opacity,"undefined")&&v(u,{opacity:l.opacity}),!t.is(l["fill-opacity"],"undefined")&&t.is(a["fill-opacity"],"undefined")&&v(u,{"fill-opacity":l["fill-opacity"]});L[e]("opacity")&&v(u,{"fill-opacity":L.opacity>1?L.opacity/100:L.opacity});case"stroke":L=t.getRGB(g),u.setAttribute(p,L.hex),"stroke"==p&&L[e]("opacity")&&v(u,{"stroke-opacity":L.opacity>1?L.opacity/100:L.opacity}),"stroke"==p&&i._.arrows&&("startString"in i._.arrows&&m(i,i._.arrows.startString),"endString"in i._.arrows&&m(i,i._.arrows.endString,1));break;case"gradient":("circle"==i.type||"ellipse"==i.type||"r"!=r(g).charAt())&&x(i,g);break;case"opacity":l.gradient&&!l[e]("stroke-opacity")&&v(u,{"stroke-opacity":g>1?g/100:g});case"fill-opacity":if(l.gradient){N=t._g.doc.getElementById(u.getAttribute("fill").replace(/^url\(#|\)$/g,c)),N&&(P=N.getElementsByTagName("stop"),v(P[P.length-1],{"stop-opacity":g}));break}default:"font-size"==p&&(g=n(g,10)+"px");var E=p.replace(/(\-.)/g,function(t){return t.substring(1).toUpperCase()});u.style[E]=g,i._.dirty=1,u.setAttribute(p,g)}}C(i,a),u.style.visibility=f},k=1.2,C=function(i,a){if("text"==i.type&&(a[e]("text")||a[e]("font")||a[e]("font-size")||a[e]("x")||a[e]("y"))){var s=i.attrs,o=i.node,u=o.firstChild?n(t._g.doc.defaultView.getComputedStyle(o.firstChild,c).getPropertyValue("font-size"),10):10;if(a[e]("text")){for(s.text=a.text;o.firstChild;)o.removeChild(o.firstChild);for(var h,l=r(a.text).split("\n"),f=[],d=0,p=l.length;p>d;d++)h=v("tspan"),d&&v(h,{dy:u*k,x:s.x}),h.appendChild(t._g.doc.createTextNode(l[d])),o.appendChild(h),f[d]=h}else for(f=o.getElementsByTagName("tspan"),d=0,p=f.length;p>d;d++)d?v(f[d],{dy:u*k,x:s.x}):v(f[0],{dy:0});v(o,{x:s.x,y:s.y}),i._.dirty=1;var g=i._getBBox(),x=s.y-(g.y+g.height/2);x&&t.is(x,"finite")&&v(f[0],{dy:x})}},B=function(e,r){this[0]=this.node=e,e.raphael=!0,this.id=t._oid++,e.raphaelid=this.id,this.matrix=t.matrix(),this.realPath=null,this.paper=r,this.attrs=this.attrs||{},this._={transform:[],sx:1,sy:1,deg:0,dx:0,dy:0,dirty:1},!r.bottom&&(r.bottom=this),this.prev=r.top,r.top&&(r.top.next=this),r.top=this,this.next=null},S=t.el;B.prototype=S,S.constructor=B,t._engine.path=function(t,e){var r=v("path");e.canvas&&e.canvas.appendChild(r);var i=new B(r,e);return i.type="path",w(i,{fill:"none",stroke:"#000",path:t}),i},S.rotate=function(t,e,n){if(this.removed)return this;if(t=r(t).split(h),t.length-1&&(e=i(t[1]),n=i(t[2])),t=i(t[0]),null==n&&(e=n),null==e||null==n){var a=this.getBBox(1);e=a.x+a.width/2,n=a.y+a.height/2}return this.transform(this._.transform.concat([["r",t,e,n]])),this},S.scale=function(t,e,n,a){if(this.removed)return this;if(t=r(t).split(h),t.length-1&&(e=i(t[1]),n=i(t[2]),a=i(t[3])),t=i(t[0]),null==e&&(e=t),null==a&&(n=a),null==n||null==a)var s=this.getBBox(1);return n=null==n?s.x+s.width/2:n,a=null==a?s.y+s.height/2:a,this.transform(this._.transform.concat([["s",t,e,n,a]])),this},S.translate=function(t,e){return this.removed?this:(t=r(t).split(h),t.length-1&&(e=i(t[1])),t=i(t[0])||0,e=+e||0,this.transform(this._.transform.concat([["t",t,e]])),this)},S.transform=function(r){var i=this._;if(null==r)return i.transform;if(t._extractTransform(this,r),this.clip&&v(this.clip,{transform:this.matrix.invert()}),this.pattern&&y(this),this.node&&v(this.node,{transform:this.matrix}),1!=i.sx||1!=i.sy){var n=this.attrs[e]("stroke-width")?this.attrs["stroke-width"]:1;this.attr({"stroke-width":n})}return this},S.hide=function(){return!this.removed&&this.paper.safari(this.node.style.display="none"),this},S.show=function(){return!this.removed&&this.paper.safari(this.node.style.display=""),this},S.remove=function(){if(!this.removed&&this.node.parentNode){var e=this.paper;e.__set__&&e.__set__.exclude(this),l.unbind("raphael.*.*."+this.id),this.gradient&&e.defs.removeChild(this.gradient),t._tear(this,e),"a"==this.node.parentNode.tagName.toLowerCase()?this.node.parentNode.parentNode.removeChild(this.node.parentNode):this.node.parentNode.removeChild(this.node);for(var r in this)this[r]="function"==typeof this[r]?t._removedFactory(r):null;this.removed=!0}},S._getBBox=function(){if("none"==this.node.style.display){this.show();var t=!0}var e={};try{e=this.node.getBBox()}catch(r){}finally{e=e||{}}return t&&this.hide(),e},S.attr=function(r,i){if(this.removed)return this;if(null==r){var n={};for(var a in this.attrs)this.attrs[e](a)&&(n[a]=this.attrs[a]);return n.gradient&&"none"==n.fill&&(n.fill=n.gradient)&&delete n.gradient,n.transform=this._.transform,n}if(null==i&&t.is(r,"string")){if("fill"==r&&"none"==this.attrs.fill&&this.attrs.gradient)return this.attrs.gradient;if("transform"==r)return this._.transform;for(var s=r.split(h),o={},u=0,c=s.length;c>u;u++)r=s[u],o[r]=r in this.attrs?this.attrs[r]:t.is(this.paper.customAttributes[r],"function")?this.paper.customAttributes[r].def:t._availableAttrs[r];return c-1?o:o[s[0]]}if(null==i&&t.is(r,"array")){for(o={},u=0,c=r.length;c>u;u++)o[r[u]]=this.attr(r[u]);return o}if(null!=i){var f={};f[r]=i}else null!=r&&t.is(r,"object")&&(f=r);for(var d in f)l("raphael.attr."+d+"."+this.id,this,f[d]);for(d in this.paper.customAttributes)if(this.paper.customAttributes[e](d)&&f[e](d)&&t.is(this.paper.customAttributes[d],"function")){var p=this.paper.customAttributes[d].apply(this,[].concat(f[d]));this.attrs[d]=f[d];for(var g in p)p[e](g)&&(f[g]=p[g])}return w(this,f),this},S.toFront=function(){if(this.removed)return this;"a"==this.node.parentNode.tagName.toLowerCase()?this.node.parentNode.parentNode.appendChild(this.node.parentNode):this.node.parentNode.appendChild(this.node);var e=this.paper;return e.top!=this&&t._tofront(this,e),this},S.toBack=function(){if(this.removed)return this;var e=this.node.parentNode;return"a"==e.tagName.toLowerCase()?e.parentNode.insertBefore(this.node.parentNode,this.node.parentNode.parentNode.firstChild):e.firstChild!=this.node&&e.insertBefore(this.node,this.node.parentNode.firstChild),t._toback(this,this.paper),this.paper,this},S.insertAfter=function(e){if(this.removed)return this;var r=e.node||e[e.length-1].node;return r.nextSibling?r.parentNode.insertBefore(this.node,r.nextSibling):r.parentNode.appendChild(this.node),t._insertafter(this,e,this.paper),this},S.insertBefore=function(e){if(this.removed)return this;var r=e.node||e[0].node;return r.parentNode.insertBefore(this.node,r),t._insertbefore(this,e,this.paper),this},S.blur=function(e){var r=this;if(0!==+e){var i=v("filter"),n=v("feGaussianBlur");r.attrs.blur=e,i.id=t.createUUID(),v(n,{stdDeviation:+e||1.5}),i.appendChild(n),r.paper.defs.appendChild(i),r._blur=i,v(r.node,{filter:"url(#"+i.id+")"})}else r._blur&&(r._blur.parentNode.removeChild(r._blur),delete r._blur,delete r.attrs.blur),r.node.removeAttribute("filter")},t._engine.circle=function(t,e,r,i){var n=v("circle");t.canvas&&t.canvas.appendChild(n);var a=new B(n,t);return a.attrs={cx:e,cy:r,r:i,fill:"none",stroke:"#000"},a.type="circle",v(n,a.attrs),a},t._engine.rect=function(t,e,r,i,n,a){var s=v("rect");t.canvas&&t.canvas.appendChild(s);var o=new B(s,t);return o.attrs={x:e,y:r,width:i,height:n,r:a||0,rx:a||0,ry:a||0,fill:"none",stroke:"#000"},o.type="rect",v(s,o.attrs),o},t._engine.ellipse=function(t,e,r,i,n){var a=v("ellipse");t.canvas&&t.canvas.appendChild(a);var s=new B(a,t);return s.attrs={cx:e,cy:r,rx:i,ry:n,fill:"none",stroke:"#000"},s.type="ellipse",v(a,s.attrs),s},t._engine.image=function(t,e,r,i,n,a){var s=v("image");v(s,{x:r,y:i,width:n,height:a,preserveAspectRatio:"none"}),s.setAttributeNS(d,"href",e),t.canvas&&t.canvas.appendChild(s);var o=new B(s,t);return o.attrs={x:r,y:i,width:n,height:a,src:e},o.type="image",o},t._engine.text=function(e,r,i,n){var a=v("text");e.canvas&&e.canvas.appendChild(a);var s=new B(a,e);return s.attrs={x:r,y:i,"text-anchor":"middle",text:n,font:t._availableAttrs.font,stroke:"none",fill:"#000"},s.type="text",w(s,s.attrs),s},t._engine.setSize=function(t,e){return this.width=t||this.width,this.height=e||this.height,this.canvas.setAttribute("width",this.width),this.canvas.setAttribute("height",this.height),this._viewBox&&this.setViewBox.apply(this,this._viewBox),this},t._engine.create=function(){var e=t._getContainer.apply(0,arguments),r=e&&e.container,i=e.x,n=e.y,a=e.width,s=e.height;if(!r)throw Error("SVG container not found.");var o,u=v("svg"),h="overflow:hidden;";return i=i||0,n=n||0,a=a||512,s=s||342,v(u,{height:s,version:1.1,width:a,xmlns:"http://www.w3.org/2000/svg"}),1==r?(u.style.cssText=h+"position:absolute;left:"+i+"px;top:"+n+"px",t._g.doc.body.appendChild(u),o=1):(u.style.cssText=h+"position:relative",r.firstChild?r.insertBefore(u,r.firstChild):r.appendChild(u)),r=new t._Paper,r.width=a,r.height=s,r.canvas=u,r.clear(),r._left=r._top=0,o&&(r.renderfix=function(){}),r.renderfix(),r},t._engine.setViewBox=function(t,e,r,i,n){l("raphael.setViewBox",this,this._viewBox,[t,e,r,i,n]);var a,o,u=s(r/this.width,i/this.height),h=this.top,c=n?"meet":"xMinYMin";for(null==t?(this._vbSize&&(u=1),delete this._vbSize,a="0 0 "+this.width+f+this.height):(this._vbSize=u,a=t+f+e+f+r+f+i),v(this.canvas,{viewBox:a,preserveAspectRatio:c});u&&h;)o="stroke-width"in h.attrs?h.attrs["stroke-width"]:1,h.attr({"stroke-width":o}),h._.dirty=1,h._.dirtyT=1,h=h.prev;return this._viewBox=[t,e,r,i,!!n],this},t.prototype.renderfix=function(){var t,e=this.canvas,r=e.style;try{t=e.getScreenCTM()||e.createSVGMatrix()}catch(i){t=e.createSVGMatrix()}var n=-t.e%1,a=-t.f%1;(n||a)&&(n&&(this._left=(this._left+n)%1,r.left=this._left+"px"),a&&(this._top=(this._top+a)%1,r.top=this._top+"px"))},t.prototype.clear=function(){t.eve("raphael.clear",this);for(var e=this.canvas;e.firstChild;)e.removeChild(e.firstChild);this.bottom=this.top=null,(this.desc=v("desc")).appendChild(t._g.doc.createTextNode("Created with Raphaël "+t.version)),e.appendChild(this.desc),e.appendChild(this.defs=v("defs"))},t.prototype.remove=function(){l("raphael.remove",this),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var e in this)this[e]="function"==typeof this[e]?t._removedFactory(e):null};var A=t.st;for(var T in S)S[e](T)&&!A[e](T)&&(A[T]=function(t){return function(){var e=arguments;return this.forEach(function(r){r[t].apply(r,e)})}}(T))}(window.Raphael);window.Raphael&&window.Raphael.vml&&function(t){var e="hasOwnProperty",r=String,i=parseFloat,n=Math,a=n.round,s=n.max,o=n.min,h=n.abs,l="fill",u=/[, ]+/,c=t.eve,f=" progid:DXImageTransform.Microsoft",p=" ",d="",g={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},v=/([clmz]),?([^clmz]*)/gi,x=/ progid:\S+Blur\([^\)]+\)/g,y=/-?[^,\s-]+/g,m="position:absolute;left:0;top:0;width:1px;height:1px",b=21600,_={path:1,rect:1,image:1},w={circle:1,ellipse:1},k=function(e){var i=/[ahqstv]/gi,n=t._pathToAbsolute;if(r(e).match(i)&&(n=t._path2curve),i=/[clmz]/g,n==t._pathToAbsolute&&!r(e).match(i)){var s=r(e).replace(v,function(t,e,r){var i=[],n="m"==e.toLowerCase(),s=g[e];return r.replace(y,function(t){n&&2==i.length&&(s+=i+g["m"==e?"l":"L"],i=[]),i.push(a(t*b))}),s+i});return s}var o,h,l=n(e);s=[];for(var u=0,c=l.length;c>u;u++){o=l[u],h=l[u][0].toLowerCase(),"z"==h&&(h="x");for(var f=1,x=o.length;x>f;f++)h+=a(o[f]*b)+(f!=x-1?",":d);s.push(h)}return s.join(p)},C=function(e,r,i){var n=t.matrix();return n.rotate(-e,.5,.5),{dx:n.x(r,i),dy:n.y(r,i)}},B=function(t,e,r,i,n,a){var s=t._,o=t.matrix,u=s.fillpos,c=t.node,f=c.style,d=1,g="",v=b/e,x=b/r;if(f.visibility="hidden",e&&r){if(c.coordsize=h(v)+p+h(x),f.rotation=a*(0>e*r?-1:1),a){var y=C(a,i,n);i=y.dx,n=y.dy}if(0>e&&(g+="x"),0>r&&(g+=" y")&&(d=-1),f.flip=g,c.coordorigin=i*-v+p+n*-x,u||s.fillsize){var m=c.getElementsByTagName(l);m=m&&m[0],c.removeChild(m),u&&(y=C(a,o.x(u[0],u[1]),o.y(u[0],u[1])),m.position=y.dx*d+p+y.dy*d),s.fillsize&&(m.size=s.fillsize[0]*h(e)+p+s.fillsize[1]*h(r)),c.appendChild(m)}f.visibility="visible"}};t.toString=function(){return"Your browser doesn’t support SVG. Falling down to VML.\nYou are running Raphaël "+this.version};var S=function(t,e,i){for(var n=r(e).toLowerCase().split("-"),a=i?"end":"start",s=n.length,o="classic",h="medium",l="medium";s--;)switch(n[s]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":o=n[s];break;case"wide":case"narrow":l=n[s];break;case"long":case"short":h=n[s]}var u=t.node.getElementsByTagName("stroke")[0];u[a+"arrow"]=o,u[a+"arrowlength"]=h,u[a+"arrowwidth"]=l},T=function(n,h){n.attrs=n.attrs||{};var c=n.node,f=n.attrs,g=c.style,v=_[n.type]&&(h.x!=f.x||h.y!=f.y||h.width!=f.width||h.height!=f.height||h.cx!=f.cx||h.cy!=f.cy||h.rx!=f.rx||h.ry!=f.ry||h.r!=f.r),x=w[n.type]&&(f.cx!=h.cx||f.cy!=h.cy||f.r!=h.r||f.rx!=h.rx||f.ry!=h.ry),y=n;for(var m in h)h[e](m)&&(f[m]=h[m]);if(v&&(f.path=t._getPath[n.type](n),n._.dirty=1),h.href&&(c.href=h.href),h.title&&(c.title=h.title),h.target&&(c.target=h.target),h.cursor&&(g.cursor=h.cursor),"blur"in h&&n.blur(h.blur),(h.path&&"path"==n.type||v)&&(c.path=k(~r(f.path).toLowerCase().indexOf("r")?t._pathToAbsolute(f.path):f.path),"image"==n.type&&(n._.fillpos=[f.x,f.y],n._.fillsize=[f.width,f.height],B(n,1,1,0,0,0))),"transform"in h&&n.transform(h.transform),x){var C=+f.cx,T=+f.cy,N=+f.rx||+f.r||0,L=+f.ry||+f.r||0;c.path=t.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x",a((C-N)*b),a((T-L)*b),a((C+N)*b),a((T+L)*b),a(C*b))}if("clip-rect"in h){var E=r(h["clip-rect"]).split(u);if(4==E.length){E[2]=+E[2]+ +E[0],E[3]=+E[3]+ +E[1];var F=c.clipRect||t._g.doc.createElement("div"),R=F.style;R.clip=t.format("rect({1}px {2}px {3}px {0}px)",E),c.clipRect||(R.position="absolute",R.top=0,R.left=0,R.width=n.paper.width+"px",R.height=n.paper.height+"px",c.parentNode.insertBefore(F,c),F.appendChild(c),c.clipRect=F)}h["clip-rect"]||c.clipRect&&(c.clipRect.style.clip="auto")}if(n.textpath){var P=n.textpath.style;h.font&&(P.font=h.font),h["font-family"]&&(P.fontFamily='"'+h["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g,d)+'"'),h["font-size"]&&(P.fontSize=h["font-size"]),h["font-weight"]&&(P.fontWeight=h["font-weight"]),h["font-style"]&&(P.fontStyle=h["font-style"])}if("arrow-start"in h&&S(y,h["arrow-start"]),"arrow-end"in h&&S(y,h["arrow-end"],1),null!=h.opacity||null!=h["stroke-width"]||null!=h.fill||null!=h.src||null!=h.stroke||null!=h["stroke-width"]||null!=h["stroke-opacity"]||null!=h["fill-opacity"]||null!=h["stroke-dasharray"]||null!=h["stroke-miterlimit"]||null!=h["stroke-linejoin"]||null!=h["stroke-linecap"]){var z=c.getElementsByTagName(l),j=!1;if(z=z&&z[0],!z&&(j=z=M(l)),"image"==n.type&&h.src&&(z.src=h.src),h.fill&&(z.on=!0),(null==z.on||"none"==h.fill||null===h.fill)&&(z.on=!1),z.on&&h.fill){var I=r(h.fill).match(t._ISURL);if(I){z.parentNode==c&&c.removeChild(z),z.rotate=!0,z.src=I[1],z.type="tile";var q=n.getBBox(1);z.position=q.x+p+q.y,n._.fillpos=[q.x,q.y],t._preload(I[1],function(){n._.fillsize=[this.offsetWidth,this.offsetHeight]})}else z.color=t.getRGB(h.fill).hex,z.src=d,z.type="solid",t.getRGB(h.fill).error&&(y.type in{circle:1,ellipse:1}||"r"!=r(h.fill).charAt())&&A(y,h.fill,z)&&(f.fill="none",f.gradient=h.fill,z.rotate=!1)}if("fill-opacity"in h||"opacity"in h){var D=((+f["fill-opacity"]+1||2)-1)*((+f.opacity+1||2)-1)*((+t.getRGB(h.fill).o+1||2)-1);D=o(s(D,0),1),z.opacity=D,z.src&&(z.color="none")}c.appendChild(z);var V=c.getElementsByTagName("stroke")&&c.getElementsByTagName("stroke")[0],O=!1;!V&&(O=V=M("stroke")),(h.stroke&&"none"!=h.stroke||h["stroke-width"]||null!=h["stroke-opacity"]||h["stroke-dasharray"]||h["stroke-miterlimit"]||h["stroke-linejoin"]||h["stroke-linecap"])&&(V.on=!0),("none"==h.stroke||null===h.stroke||null==V.on||0==h.stroke||0==h["stroke-width"])&&(V.on=!1);var G=t.getRGB(h.stroke);V.on&&h.stroke&&(V.color=G.hex),D=((+f["stroke-opacity"]+1||2)-1)*((+f.opacity+1||2)-1)*((+G.o+1||2)-1);var Y=.75*(i(h["stroke-width"])||1);if(D=o(s(D,0),1),null==h["stroke-width"]&&(Y=f["stroke-width"]),h["stroke-width"]&&(V.weight=Y),Y&&1>Y&&(D*=Y)&&(V.weight=1),V.opacity=D,h["stroke-linejoin"]&&(V.joinstyle=h["stroke-linejoin"]||"miter"),V.miterlimit=h["stroke-miterlimit"]||8,h["stroke-linecap"]&&(V.endcap="butt"==h["stroke-linecap"]?"flat":"square"==h["stroke-linecap"]?"square":"round"),h["stroke-dasharray"]){var W={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};V.dashstyle=W[e](h["stroke-dasharray"])?W[h["stroke-dasharray"]]:d}O&&c.appendChild(V)}if("text"==y.type){y.paper.canvas.style.display=d;var X=y.paper.span,H=100,U=f.font&&f.font.match(/\d+(?:\.\d*)?(?=px)/);g=X.style,f.font&&(g.font=f.font),f["font-family"]&&(g.fontFamily=f["font-family"]),f["font-weight"]&&(g.fontWeight=f["font-weight"]),f["font-style"]&&(g.fontStyle=f["font-style"]),U=i(f["font-size"]||U&&U[0])||10,g.fontSize=U*H+"px",y.textpath.string&&(X.innerHTML=r(y.textpath.string).replace(/</g,"&#60;").replace(/&/g,"&#38;").replace(/\n/g,"<br>"));var $=X.getBoundingClientRect();y.W=f.w=($.right-$.left)/H,y.H=f.h=($.bottom-$.top)/H,y.X=f.x,y.Y=f.y+y.H/2,("x"in h||"y"in h)&&(y.path.v=t.format("m{0},{1}l{2},{1}",a(f.x*b),a(f.y*b),a(f.x*b)+1));for(var Z=["x","y","text","font","font-family","font-weight","font-style","font-size"],Q=0,J=Z.length;J>Q;Q++)if(Z[Q]in h){y._.dirty=1;break}switch(f["text-anchor"]){case"start":y.textpath.style["v-text-align"]="left",y.bbx=y.W/2;break;case"end":y.textpath.style["v-text-align"]="right",y.bbx=-y.W/2;break;default:y.textpath.style["v-text-align"]="center",y.bbx=0}y.textpath.style["v-text-kern"]=!0}},A=function(e,a,s){e.attrs=e.attrs||{};var o=(e.attrs,Math.pow),h="linear",l=".5 .5";if(e.attrs.gradient=a,a=r(a).replace(t._radial_gradient,function(t,e,r){return h="radial",e&&r&&(e=i(e),r=i(r),o(e-.5,2)+o(r-.5,2)>.25&&(r=n.sqrt(.25-o(e-.5,2))*(2*(r>.5)-1)+.5),l=e+p+r),d}),a=a.split(/\s*\-\s*/),"linear"==h){var u=a.shift();if(u=-i(u),isNaN(u))return null}var c=t._parseDots(a);if(!c)return null;if(e=e.shape||e.node,c.length){e.removeChild(s),s.on=!0,s.method="none",s.color=c[0].color,s.color2=c[c.length-1].color;for(var f=[],g=0,v=c.length;v>g;g++)c[g].offset&&f.push(c[g].offset+p+c[g].color);s.colors=f.length?f.join():"0% "+s.color,"radial"==h?(s.type="gradientTitle",s.focus="100%",s.focussize="0 0",s.focusposition=l,s.angle=0):(s.type="gradient",s.angle=(270-u)%360),e.appendChild(s)}return 1},N=function(e,r){this[0]=this.node=e,e.raphael=!0,this.id=t._oid++,e.raphaelid=this.id,this.X=0,this.Y=0,this.attrs={},this.paper=r,this.matrix=t.matrix(),this._={transform:[],sx:1,sy:1,dx:0,dy:0,deg:0,dirty:1,dirtyT:1},!r.bottom&&(r.bottom=this),this.prev=r.top,r.top&&(r.top.next=this),r.top=this,this.next=null},L=t.el;N.prototype=L,L.constructor=N,L.transform=function(e){if(null==e)return this._.transform;var i,n=this.paper._viewBoxShift,a=n?"s"+[n.scale,n.scale]+"-1-1t"+[n.dx,n.dy]:d;n&&(i=e=r(e).replace(/\.{3}|\u2026/g,this._.transform||d)),t._extractTransform(this,a+e);var s,o=this.matrix.clone(),h=this.skew,l=this.node,u=~r(this.attrs.fill).indexOf("-"),c=!r(this.attrs.fill).indexOf("url(");if(o.translate(-.5,-.5),c||u||"image"==this.type)if(h.matrix="1 0 0 1",h.offset="0 0",s=o.split(),u&&s.noRotation||!s.isSimple){l.style.filter=o.toFilter();var f=this.getBBox(),g=this.getBBox(1),v=f.x-g.x,x=f.y-g.y;l.coordorigin=v*-b+p+x*-b,B(this,1,1,v,x,0)}else l.style.filter=d,B(this,s.scalex,s.scaley,s.dx,s.dy,s.rotate);else l.style.filter=d,h.matrix=r(o),h.offset=o.offset();return i&&(this._.transform=i),this},L.rotate=function(t,e,n){if(this.removed)return this;if(null!=t){if(t=r(t).split(u),t.length-1&&(e=i(t[1]),n=i(t[2])),t=i(t[0]),null==n&&(e=n),null==e||null==n){var a=this.getBBox(1);e=a.x+a.width/2,n=a.y+a.height/2}return this._.dirtyT=1,this.transform(this._.transform.concat([["r",t,e,n]])),this}},L.translate=function(t,e){return this.removed?this:(t=r(t).split(u),t.length-1&&(e=i(t[1])),t=i(t[0])||0,e=+e||0,this._.bbox&&(this._.bbox.x+=t,this._.bbox.y+=e),this.transform(this._.transform.concat([["t",t,e]])),this)},L.scale=function(t,e,n,a){if(this.removed)return this;if(t=r(t).split(u),t.length-1&&(e=i(t[1]),n=i(t[2]),a=i(t[3]),isNaN(n)&&(n=null),isNaN(a)&&(a=null)),t=i(t[0]),null==e&&(e=t),null==a&&(n=a),null==n||null==a)var s=this.getBBox(1);return n=null==n?s.x+s.width/2:n,a=null==a?s.y+s.height/2:a,this.transform(this._.transform.concat([["s",t,e,n,a]])),this._.dirtyT=1,this},L.hide=function(){return!this.removed&&(this.node.style.display="none"),this},L.show=function(){return!this.removed&&(this.node.style.display=d),this},L._getBBox=function(){return this.removed?{}:{x:this.X+(this.bbx||0)-this.W/2,y:this.Y-this.H,width:this.W,height:this.H}},L.remove=function(){if(!this.removed&&this.node.parentNode){this.paper.__set__&&this.paper.__set__.exclude(this),t.eve.unbind("raphael.*.*."+this.id),t._tear(this,this.paper),this.node.parentNode.removeChild(this.node),this.shape&&this.shape.parentNode.removeChild(this.shape);for(var e in this)this[e]="function"==typeof this[e]?t._removedFactory(e):null;this.removed=!0}},L.attr=function(r,i){if(this.removed)return this;if(null==r){var n={};for(var a in this.attrs)this.attrs[e](a)&&(n[a]=this.attrs[a]);return n.gradient&&"none"==n.fill&&(n.fill=n.gradient)&&delete n.gradient,n.transform=this._.transform,n}if(null==i&&t.is(r,"string")){if(r==l&&"none"==this.attrs.fill&&this.attrs.gradient)return this.attrs.gradient;for(var s=r.split(u),o={},h=0,f=s.length;f>h;h++)r=s[h],o[r]=r in this.attrs?this.attrs[r]:t.is(this.paper.customAttributes[r],"function")?this.paper.customAttributes[r].def:t._availableAttrs[r];return f-1?o:o[s[0]]}if(this.attrs&&null==i&&t.is(r,"array")){for(o={},h=0,f=r.length;f>h;h++)o[r[h]]=this.attr(r[h]);return o}var p;null!=i&&(p={},p[r]=i),null==i&&t.is(r,"object")&&(p=r);for(var d in p)c("raphael.attr."+d+"."+this.id,this,p[d]);if(p){for(d in this.paper.customAttributes)if(this.paper.customAttributes[e](d)&&p[e](d)&&t.is(this.paper.customAttributes[d],"function")){var g=this.paper.customAttributes[d].apply(this,[].concat(p[d]));this.attrs[d]=p[d];for(var v in g)g[e](v)&&(p[v]=g[v])}p.text&&"text"==this.type&&(this.textpath.string=p.text),T(this,p)}return this},L.toFront=function(){return!this.removed&&this.node.parentNode.appendChild(this.node),this.paper&&this.paper.top!=this&&t._tofront(this,this.paper),this},L.toBack=function(){return this.removed?this:(this.node.parentNode.firstChild!=this.node&&(this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild),t._toback(this,this.paper)),this)},L.insertAfter=function(e){return this.removed?this:(e.constructor==t.st.constructor&&(e=e[e.length-1]),e.node.nextSibling?e.node.parentNode.insertBefore(this.node,e.node.nextSibling):e.node.parentNode.appendChild(this.node),t._insertafter(this,e,this.paper),this)},L.insertBefore=function(e){return this.removed?this:(e.constructor==t.st.constructor&&(e=e[0]),e.node.parentNode.insertBefore(this.node,e.node),t._insertbefore(this,e,this.paper),this)},L.blur=function(e){var r=this.node.runtimeStyle,i=r.filter;i=i.replace(x,d),0!==+e?(this.attrs.blur=e,r.filter=i+p+f+".Blur(pixelradius="+(+e||1.5)+")",r.margin=t.format("-{0}px 0 0 -{0}px",a(+e||1.5))):(r.filter=i,r.margin=0,delete this.attrs.blur)},t._engine.path=function(t,e){var r=M("shape");r.style.cssText=m,r.coordsize=b+p+b,r.coordorigin=e.coordorigin;var i=new N(r,e),n={fill:"none",stroke:"#000"};t&&(n.path=t),i.type="path",i.path=[],i.Path=d,T(i,n),e.canvas.appendChild(r);var a=M("skew");return a.on=!0,r.appendChild(a),i.skew=a,i.transform(d),i},t._engine.rect=function(e,r,i,n,a,s){var o=t._rectPath(r,i,n,a,s),h=e.path(o),l=h.attrs;return h.X=l.x=r,h.Y=l.y=i,h.W=l.width=n,h.H=l.height=a,l.r=s,l.path=o,h.type="rect",h},t._engine.ellipse=function(t,e,r,i,n){var a=t.path();return a.attrs,a.X=e-i,a.Y=r-n,a.W=2*i,a.H=2*n,a.type="ellipse",T(a,{cx:e,cy:r,rx:i,ry:n}),a},t._engine.circle=function(t,e,r,i){var n=t.path();return n.attrs,n.X=e-i,n.Y=r-i,n.W=n.H=2*i,n.type="circle",T(n,{cx:e,cy:r,r:i}),n},t._engine.image=function(e,r,i,n,a,s){var o=t._rectPath(i,n,a,s),h=e.path(o).attr({stroke:"none"}),u=h.attrs,c=h.node,f=c.getElementsByTagName(l)[0];return u.src=r,h.X=u.x=i,h.Y=u.y=n,h.W=u.width=a,h.H=u.height=s,u.path=o,h.type="image",f.parentNode==c&&c.removeChild(f),f.rotate=!0,f.src=r,f.type="tile",h._.fillpos=[i,n],h._.fillsize=[a,s],c.appendChild(f),B(h,1,1,0,0,0),h},t._engine.text=function(e,i,n,s){var o=M("shape"),h=M("path"),l=M("textpath");i=i||0,n=n||0,s=s||"",h.v=t.format("m{0},{1}l{2},{1}",a(i*b),a(n*b),a(i*b)+1),h.textpathok=!0,l.string=r(s),l.on=!0,o.style.cssText=m,o.coordsize=b+p+b,o.coordorigin="0 0";var u=new N(o,e),c={fill:"#000",stroke:"none",font:t._availableAttrs.font,text:s};u.shape=o,u.path=h,u.textpath=l,u.type="text",u.attrs.text=r(s),u.attrs.x=i,u.attrs.y=n,u.attrs.w=1,u.attrs.h=1,T(u,c),o.appendChild(l),o.appendChild(h),e.canvas.appendChild(o);var f=M("skew");return f.on=!0,o.appendChild(f),u.skew=f,u.transform(d),u},t._engine.setSize=function(e,r){var i=this.canvas.style;return this.width=e,this.height=r,e==+e&&(e+="px"),r==+r&&(r+="px"),i.width=e,i.height=r,i.clip="rect(0 "+e+" "+r+" 0)",this._viewBox&&t._engine.setViewBox.apply(this,this._viewBox),this},t._engine.setViewBox=function(e,r,i,n,a){t.eve("raphael.setViewBox",this,this._viewBox,[e,r,i,n,a]);var o,h,l=this.width,u=this.height,c=1/s(i/l,n/u);return a&&(o=u/n,h=l/i,l>i*o&&(e-=(l-i*o)/2/o),u>n*h&&(r-=(u-n*h)/2/h)),this._viewBox=[e,r,i,n,!!a],this._viewBoxShift={dx:-e,dy:-r,scale:c},this.forEach(function(t){t.transform("...")}),this};var M;t._engine.initWin=function(t){var e=t.document;e.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!e.namespaces.rvml&&e.namespaces.add("rvml","urn:schemas-microsoft-com:vml"),M=function(t){return e.createElement("<rvml:"+t+' class="rvml">')}}catch(r){M=function(t){return e.createElement("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}},t._engine.initWin(t._g.win),t._engine.create=function(){var e=t._getContainer.apply(0,arguments),r=e.container,i=e.height,n=e.width,a=e.x,s=e.y;if(!r)throw Error("VML container not found.");var o=new t._Paper,h=o.canvas=t._g.doc.createElement("div"),l=h.style;return a=a||0,s=s||0,n=n||512,i=i||342,o.width=n,o.height=i,n==+n&&(n+="px"),i==+i&&(i+="px"),o.coordsize=1e3*b+p+1e3*b,o.coordorigin="0 0",o.span=t._g.doc.createElement("span"),o.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;",h.appendChild(o.span),l.cssText=t.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",n,i),1==r?(t._g.doc.body.appendChild(h),l.left=a+"px",l.top=s+"px",l.position="absolute"):r.firstChild?r.insertBefore(h,r.firstChild):r.appendChild(h),o.renderfix=function(){},o},t.prototype.clear=function(){t.eve("raphael.clear",this),this.canvas.innerHTML=d,this.span=t._g.doc.createElement("span"),this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;",this.canvas.appendChild(this.span),this.bottom=this.top=null},t.prototype.remove=function(){t.eve("raphael.remove",this),this.canvas.parentNode.removeChild(this.canvas);for(var e in this)this[e]="function"==typeof this[e]?t._removedFactory(e):null;return!0};var E=t.st;for(var F in L)L[e](F)&&!E[e](F)&&(E[F]=function(t){return function(){var e=arguments;return this.forEach(function(r){r[t].apply(r,e)})}}(F))}(window.Raphael);
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
  this.isDeletable = (options.isDeletable != undefined) ? options.isDeletable : true;
  this.x = options.x !== undefined ? options.x :  240;
  this.y = options.y !== undefined ? options.y : 120;
  this.height = options.height || 60;
  this.width = options.width || 90;
  this.drawing = options.drawing || false;
}

module.exports = Element;
});
require.register("happygui-collection/index.js", function(exports, require, module){
function Collection(models) {
  this.models = models || [];
}

Collection.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function(){ return self.length() },
    get: function(i){ return self.models[i] }
  }
};

Collection.prototype.length = function(){
  return this.models.length;
};

Collection.prototype.push = function(model){
  return this.models.push(model);
};

module.exports = Collection;
});
require.register("happygui-textelement/index.js", function(exports, require, module){
var Element = require('happygui-element');

var TextElement = function(options) {
  Element.call(this, options); // Super
  options = options || {};

  this.hasFontSize = true;
  this.hasFontColor = true;

  this.fontSize = options.fontSize || 25;
  this.fontColor = options.fontColor || "#000";
};
TextElement.prototype = Object.create(Element.prototype);
TextElement.prototype.constructor = TextElement;

TextElement.prototype.redraw = function () {
  this.drawing.attr({
    fill: this.fontColor,
    font: "italic "+this.fontSize+"px Helvetica"
  });
}
TextElement.prototype.draw = function (paper, callback) {
  var self = this;


  this.drawing = paper
    .text(self.x, self.y, "Jeaaaaaaaaaaaaaaah")
    .attr({
      fill: self.fontColor,
      dy: 0,
      dx: 0,
      font: "italic "+self.fontSize+"px Helvetica"
    })
    .drag(
    function(dx, dy, x, y) {
      console.log(dx, dy, x, y);
      this.attr({x: self.x + dx, y: self.y + dy, dy:0, dx:0});
      console.log("one", this.attr("x")+dx, this.attr("y")+dy);
    },
    function () {
      console.log("two", this.attr("x"),this.attr("y"));
      this.attr({x: self.x, y: self.y, dy:0, dx:0});
      console.log("two", this.attr("x"),this.attr("y"));
    },
    function () {
      self.x = this.attr("x");
      self.y = this.attr("y");
      console.log("three", this.attr("x"), this.attr("y"));
      callback(self.x, self.y);
    }
  );

  return this.drawing;
};

module.exports = TextElement;
});
require.register("happygui-shapeelement/index.js", function(exports, require, module){
var Element = require('happygui-element');

var ShapeElement = function(options) {
  Element.call(this, options); // Super

  this.hasBorderColor = true;
  this.hasBorderThickness = true;
  this.hasBackgroundColor = true;

  this.borderColor = options.borderColor || "#cc0000";
  this.borderThickness = options.borderThickness || 5;
  this.backgroundColor = options.backgroundColor || "#00cc00";
};
ShapeElement.prototype = Object.create(Element.prototype);
ShapeElement.prototype.constructor = ShapeElement;

module.exports = ShapeElement;
});
require.register("happygui-circleelement/index.js", function(exports, require, module){
var ShapeElement = require('happygui-shapeelement');

var CircleElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

  this.hasRadius = true;
  this.radius = options.radius || 60;
};
CircleElement.prototype = Object.create(ShapeElement.prototype);
CircleElement.prototype.constructor = CircleElement;
CircleElement.prototype.setPos = function (x,y) {
  this.x = x;
  this.y = y;
  console.log(x,y, this.x, this.y);
};
CircleElement.prototype.redraw = function () {
  this.drawing.attr({
    stroke: this.borderColor,
    fill: this.backgroundColor,
    "stroke-width": this.borderThickness
  });

  return this;
};
CircleElement.prototype.draw = function (paper, callback) {

  var self = this;

  this.drawing = paper
    .circle(self.x, self.y, self.radius)
    .attr({
      stroke: self.borderColor,
      fill: self.backgroundColor,
      "fill-opacity": .5,
      "stroke-width": self.borderThickness,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    })
    .drag(
      function (dx, dy) {
        this.attr({
          cx: Math.min(Math.max(self.x + dx, self.radius + 5), 480-(self.radius+5)),
          cy: Math.min(Math.max(self.y + dy, self.radius + 5), 600-(self.radius+5))
        });
      },
      function () {
      },
      function () {
        self.x = this.attr("cx");
        self.y = this.attr("cy");
        callback(self.x, self.y);
      }
    );

  return this.drawing;
};

module.exports = CircleElement;
});
require.register("happygui-rectelement/index.js", function(exports, require, module){
var ShapeElement = require('happygui-shapeelement');

var RectElement = function(options) {
  ShapeElement.call(this, options); // Super
  options = options || {};

};
RectElement.prototype = Object.create(ShapeElement.prototype);
RectElement.prototype.constructor = RectElement;

RectElement.prototype.redraw = function() {
  this.drawing.attr({
    stroke: this.borderColor,
      fill: this.backgroundColor,
    "stroke-width": this.borderThickness
  });
};

RectElement.prototype.draw = function (paper, callback) {
  var self = this;

  this.drawing = paper
    .rect(self.x, self.y, self.width, self.height)
    .attr({
      stroke: self.borderColor,
      fill: self.backgroundColor,
      "fill-opacity": .5,
      "stroke-width": self.borderThickness,
      "stroke-linecap": "round",
      "stroke-linejoin": "round"
    })
    .drag(
      function(dx, dy, x, y) {
        this.attr({x: self.x + dx, y: self.y + dy});
      },
      function () {
      },
      function () {
        self.x = this.attr("x");
        self.y = this.attr("y");
        callback(self.x, self.y);
      }
    );

  return this.drawing;
};

module.exports = RectElement;
});
require.register("happygui-view/index.js", function(exports, require, module){
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
});
require.register("happygui-templates/index.js", function(exports, require, module){
var Templates = (function (){
  var templates = {};
  var allScripts = document.getElementsByTagName('script');

  function compile (doc) {
    return Handlebars.compile(doc.innerHTML);
  }

  for (var i=0; i<allScripts.length; i++) {
    if (allScripts[i].getAttribute('type') === 'text/html') {
      templates[allScripts[i].getAttribute('id').replace("_tpl",'')] = compile(allScripts[i]);
    }
  }

  return {
    get: function (template) {
      return templates[template];
    }
  };
})();

module.exports = Templates;
});
require.register("happygui-elementfactory/index.js", function(exports, require, module){
var TextElement = require('happygui-textelement');
var CircleElement = require('happygui-circleelement');
var RectElement = require('happygui-rectelement');

var ElementFactory = {
  create: function (doc) {
    var element;

    switch (doc.type) {
      case "image":
        break;
      case "circle":
        element = new CircleElement(doc);
        break;
      case "rect":
        element = new RectElement(doc);
        break;
      case "text":
        element = new TextElement(doc);
        break;
      default:
        //TODO throw error
        alert("type not recognised, sorry");
    }

    return element;
  },
  prototype: function (type) {
    var prototype;
    switch (type) {
      case "image":
        break;
      case "circle":
        prototype = CircleElement.prototype;
        break;
      case "rect":
        prototype = RectElement.prototype;
        break;
      case "text":
        prototype = TextElement.prototype;
        break;
      default:
        //TODO throw error
        alert("type not recognised, sorry");
    }
    return prototype;
  }
};

module.exports = ElementFactory;
});
require.register("boot/boot.js", function(exports, require, module){

});
require.alias("component-emitter/index.js", "happygui/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-delegate/index.js", "happygui/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-gesture/index.js", "happygui/deps/gesture/index.js");
require.alias("component-emitter/index.js", "component-gesture/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-hammer.js/index.js", "component-gesture/deps/hammer/index.js");

require.alias("richthegeek-raphael/raphael-min.js", "happygui/deps/raphael/raphael-min.js");
require.alias("richthegeek-raphael/raphael-min.js", "happygui/deps/raphael/index.js");
require.alias("adobe-webplatform-eve/eve.js", "richthegeek-raphael/deps/eve/eve.js");
require.alias("adobe-webplatform-eve/eve.js", "richthegeek-raphael/deps/eve/index.js");
require.alias("adobe-webplatform-eve/eve.js", "adobe-webplatform-eve/index.js");

require.alias("richthegeek-raphael/raphael-min.js", "richthegeek-raphael/index.js");

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

require.alias("component-delegate/index.js", "boot/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-gesture/index.js", "boot/deps/gesture/index.js");
require.alias("component-emitter/index.js", "component-gesture/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-hammer.js/index.js", "component-gesture/deps/hammer/index.js");

require.alias("richthegeek-raphael/raphael-min.js", "boot/deps/raphael/raphael-min.js");
require.alias("richthegeek-raphael/raphael-min.js", "boot/deps/raphael/index.js");
require.alias("adobe-webplatform-eve/eve.js", "richthegeek-raphael/deps/eve/eve.js");
require.alias("adobe-webplatform-eve/eve.js", "richthegeek-raphael/deps/eve/index.js");
require.alias("adobe-webplatform-eve/eve.js", "adobe-webplatform-eve/index.js");

require.alias("richthegeek-raphael/raphael-min.js", "richthegeek-raphael/index.js");

require.alias("happygui-element/index.js", "boot/deps/happygui-element/index.js");

require.alias("happygui-collection/index.js", "boot/deps/happygui-collection/index.js");

require.alias("happygui-textelement/index.js", "boot/deps/happygui-textelement/index.js");
require.alias("happygui-element/index.js", "happygui-textelement/deps/happygui-element/index.js");

require.alias("happygui-shapeelement/index.js", "boot/deps/happygui-shapeelement/index.js");
require.alias("happygui-element/index.js", "happygui-shapeelement/deps/happygui-element/index.js");

require.alias("happygui-circleelement/index.js", "boot/deps/happygui-circleelement/index.js");
require.alias("happygui-shapeelement/index.js", "happygui-circleelement/deps/happygui-shapeelement/index.js");
require.alias("happygui-element/index.js", "happygui-shapeelement/deps/happygui-element/index.js");

require.alias("happygui-rectelement/index.js", "boot/deps/happygui-rectelement/index.js");
require.alias("happygui-shapeelement/index.js", "happygui-rectelement/deps/happygui-shapeelement/index.js");
require.alias("happygui-element/index.js", "happygui-shapeelement/deps/happygui-element/index.js");

require.alias("happygui-view/index.js", "boot/deps/happygui-view/index.js");
require.alias("component-delegate/index.js", "happygui-view/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("happygui-templates/index.js", "boot/deps/happygui-templates/index.js");

require.alias("happygui-elementfactory/index.js", "boot/deps/happygui-elementfactory/index.js");
require.alias("happygui-circleelement/index.js", "happygui-elementfactory/deps/happygui-circleelement/index.js");
require.alias("happygui-shapeelement/index.js", "happygui-circleelement/deps/happygui-shapeelement/index.js");
require.alias("happygui-element/index.js", "happygui-shapeelement/deps/happygui-element/index.js");

require.alias("happygui-rectelement/index.js", "happygui-elementfactory/deps/happygui-rectelement/index.js");
require.alias("happygui-shapeelement/index.js", "happygui-rectelement/deps/happygui-shapeelement/index.js");
require.alias("happygui-element/index.js", "happygui-shapeelement/deps/happygui-element/index.js");

require.alias("happygui-textelement/index.js", "happygui-elementfactory/deps/happygui-textelement/index.js");
require.alias("happygui-element/index.js", "happygui-textelement/deps/happygui-element/index.js");

require.alias("boot/boot.js", "boot/index.js");

