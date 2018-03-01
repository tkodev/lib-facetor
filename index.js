var bigInt = require('big-integer')
var _ = require('underscore')

function Constructor(config, importing) {

	// ****************************************************************************************************
	// Shared functions
	// ****************************************************************************************************

	// shared - deep clone an object
	function deepClone(obj){
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
	}

	// shared - deep map an object, call function on node with bitmap key (recursive)
	function deepForEach(node, callback, path, level){
		path = path || "index";
		level = level || 0;
		if(node.hasOwnProperty("bitmap")){
			return callback(node, path, level)
		} else {
			node = _.mapObject(node, function(childNode, key) {
				var childPath = path+"."+key;
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
	function setBigInt(index, boolean){
		return deepForEach(index, function(node, path){
			if(node.bitmap){
				node.status = boolean;
			}
			return node;
		});
	}

	// shared - set bitmaps to big int based on boolean
	function setBigInt(index, boolean){
		return deepForEach(index, function(node, path){
			if(node.bitmap){
				node.bitmap = boolean ? bigInt(node.bitmap, 2) : bitmap.toString(2);
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
							bitmap: ''
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
						index[facetKey][facet].bitmap = '1' + index[facetKey][facet].bitmap;
					} else {
						index[facetKey][facet].bitmap = '0' + index[facetKey][facet].bitmap;
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
	getBitmap(index, facets, path){
		var tempFacets = deepClone(facets).push(path);
		var tempIndex = deepClone(index);
		tempFacets.forEach(function(facet){
			tempIndex = setObjProp(tempIndex, facet, true);
		})
		// index to bitmap logic here
	}

	// get count based on suppled bitmap
	getCount(bitmap){
		// bitmap to count logic here
	}

	// get products based on supplied bitmap
	getItems(bitmap){
		// bitmap to items logic here
	}
	


	// ****************************************************************************************************
	// Main Logic
	// ****************************************************************************************************

	// internal - init constructor
	var store = deepClone(config) || {
		index: {},
		items: {}
	};
	if (!importing){
		store.index = buildIndex(store.items, store.index);
		store.index = convertBitmaps(store.items, store.index);
	}

	// external - build results
	this.search = function search(options){
		var results = deepClone(store);
		results.index = setBigInt(results.index, true);
		results.index = deepForEach(results.index, function(node, path, level){
			node.bitmap = getBitmap(results.index, options.facets, path);
			node.count = getCount(node.bitmap);
			return node;
		})
		results.items = getItems(results.index.bitmap);
		return results;
	};
	
};

module.exports = exports = Constructor;