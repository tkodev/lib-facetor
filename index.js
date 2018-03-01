var bigInt = require('big-integer')
var _ = require('underscore')

function Constructor(config) {

	// ****************************************************************************************************
	// Shared functions
	// ****************************************************************************************************

	// shared - deep clone an object
	function deepClone(obj){
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
	}

	// shared - deep map an object, call function on node with bitmap key (recursive)
	function deepForEach(node, callback, path, level){
		path = path || "";
		level = level || 0;
		if(node.hasOwnProperty("bitmap")){
			return callback(node, path, level)
		} else {
			node = _.mapObject(node, function(childNode, key) {
				var childPath = path ? path+"."+key : key;
				var childLevel = level + 1;
				return deepForEach(childNode, callback, childPath, childLevel)
			});
			return callback(node, path, level)
		}
	}

	// shared - Set an object's deep nested property based on "|" delimited string path
	function setObjProp(obj, path, val) {
		path = path.split('.');
		for (i = 0; i < path.length - 1; i++){
			if(_.keys(obj).indexOf(path[i]) > -1){
				obj = obj[path[i]];
			}
		}
		if(_.keys(obj).indexOf(path[i]) > -1){
			obj[path[i]] = val;
		}
	}

	// shared - Get an object's deep nested property based on "|" delimited string path
	function getObjProp(obj, path){
		for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
			if(_.keys(obj).indexOf(path[i]) > -1){
				obj = obj[path[i]];
			}
		};
		return obj;
	};
	
	// shared - set status based on boolean
	function setStatus(index, boolean){
		return deepForEach(index, function(node, path){
			if(node._bitmap){
				node._status = boolean;
			}
			return node;
		});
	}

	// shared - set bitmaps to big int based on boolean
	function setBigInt(index, boolean){
		return deepForEach(index, function(node, path){
			if(node._bitmap){
				node._bitmap = boolean ? bigInt(node._bitmap, 2) : bitmap.toString(2);
			}
			return node;
		});
	}

	// ****************************************************************************************************
	// Index functions
	// ****************************************************************************************************

	// index - build item facets into index
	function buildIndex(items, index){
		items.forEach(function(item){
			Object.keys(index).forEach(function(facetKey){
				if(item.hasOwnProperty(facetKey)){
					var itemValues = Array.isArray(item[facetKey]) ? item[facetKey] : [ item[facetKey] ];
					itemValues.forEach(function (facet) {
						index[facetKey][facet] = index[facetKey][facet] || {
							_bitmap: ''
						};
					});
				}
			})
		})
		return index;
	}

	// index - convert item positions to facet binary bitmap
	function convertBitmaps(items, index){
		items.forEach(function(item){
			Object.keys(index).forEach(function(facetKey){
				Object.keys(index[facetKey]).forEach(function(facet){
					var itemValues = Array.isArray(item[facetKey]) ? item[facetKey] : [ item[facetKey] ];
					if(itemValues.indexOf(facet) > -1){
						index[facetKey][facet]._bitmap = '1' + index[facetKey][facet]._bitmap;
					} else {
						index[facetKey][facet]._bitmap = '0' + index[facetKey][facet]._bitmap;
					}
				})
			})
		})
		return index;
	}


	// ****************************************************************************************************
	// Results functions
	// ****************************************************************************************************

	// results - get bitmap based on supplied index, facets and current path
	function getBitmap(index, options, node, path, length){
		var tempFacets = deepClone(options.facets)
		var tempIndex = deepClone(index);
		var allOnes = bigInt(1).shiftLeft(length).minus(1);
		if(path){
			tempFacets.push(path);
		}
		tempFacets.forEach(function(facet){
			tempIndex = setObjProp(tempIndex, path, setStatus(node, true));
		})
		// index to bitmap logic here
		// return bigInt(0);
		return allOnes
	}

	// results - get count based on suppled bitmap
	function getCount(bitmap){
		var count = 0;
		while (bitmap > 0) {
			// Count all the 1s in curBitmap, which is the count of matched products
			bitmap = bitmap.and(bitmap.minus(1));
			count++;
		}
		return count;
	}

	// results - get products based on supplied bitmap
	function getItems(items, bitmap){
		return items.filter(function(elem, idx){
			return bitmap.and(bigInt(1).shiftLeft(idx)) > 0;
		})
	}


	// ****************************************************************************************************
	// Main Logic
	// ****************************************************************************************************

	// internal - build index
	var store = {
		index: {},
		items: []
	};
	if (config){
		store = deepClone(config)
		store.index = buildIndex(store.items, store.index);
		store.index = convertBitmaps(store.items, store.index);
	}

	// external - build results
	this.getResults = function getResults(options){
		var results = deepClone(store);
		results.index = setBigInt(results.index, true);
		results.index = deepForEach(results.index, function(node, path, level){
			node._bitmap = getBitmap(results.index, options, node, path, results.items.length);
			node._count = getCount(node._bitmap);
			node._path = path;
			node._level = level;
			return node;
		})
		results.items = getItems(results.items, results.index._bitmap);
		return results;
	};

	// external - export store
	this.getStore = function getStore(){
		return store;
	}
	// external - import store
	this.setStore = function setStore(input){
		return store = input;
	}
	
};

module.exports = exports = Constructor;