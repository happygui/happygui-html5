/**
* This handles the collections which contain the elements
*
* @class Collection
* @param models {}
*/
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


/**
* Finds how many elements there are in a collection
*
* @method length
* @return {Integer} Returns the length of the array
*/
Collection.prototype.length = function(){
  return this.models.length;
};

/**
* Adds an element to the collection
*
* @method push
* @param model {} The information of the element which needs to be added into the collection
* @return {Collection} Returns an updated array which is the up to date collection
*/
Collection.prototype.push = function(model){
  return this.models.push(model);
};

module.exports = Collection;