/**
 *
 *
 * @class Templates
 */

function Streaming() {
  this.streaming = false;
}

Streaming.prototype.putCollection = function(data) {
  if (this.streaming) this.socket.emit('putCollection', data);
  return this;
};

Streaming.prototype.createElement = function(data) {
  if (this.streaming) this.socket.emit('createElement', data);
  return this;
};

Streaming.prototype.deleteElement = function(i) {
  if (this.streaming) this.socket.emit('deleteElement', i);
  return this;
};

Streaming.prototype.updateElement = function(element, key, value) {
  if (this.streaming) this.socket.emit('updateElement', element, key, value);
  return this;
};

Streaming.prototype.active = function () {
  return this.streaming;
};
Streaming.prototype.on = function() {
    this.streaming = true;
};

Streaming.prototype.off = function() {
  this.streaming = false;
};

Streaming.prototype.connect = function() {
  //load socket
  this.socket = io.connect('http://localhost:1234');
  var self = this;
  this.socket.on("connected", function(data){
    alert(data);
    self.on();
  })
};

Streaming.prototype.getInstance = function() {
  if (typeof io !== 'undefined') this.connect();
  return this;
};

module.exports = new Streaming();