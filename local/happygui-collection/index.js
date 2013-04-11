function Collection(models) {
  this.models = models || [];
}

Collection.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function(){ return self.length() },
    getCollections: function(i){ return self.models[i] }
  }
};

Collection.prototype.length = function(){
  return this.models.length;
};

Collection.prototype.push = function(model){
  return this.models.push(model);
};

module.exports = Collection;