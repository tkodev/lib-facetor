var bigInt = require('big-integer')

function Constructor(config, importing) {

	// shared - deep clone an object
	function deepClone(obj){
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
	}

	// index - build item facets into index
	function buildFacets(items, facets){
		items.forEach(function(item){
			Object.keys(facets).forEach(function(facetKey){
				if(item.hasOwnProperty(facetKey)){
					var itemValues = Array.isArray(item[facetKey]) ? item[facetKey] : [ item[facetKey] ];
					itemValues.forEach(function (facet) {
						facets[facetKey][facet] = facets[facetKey][facet] || {
							bitmap: ''
						};
					});
				}
			})
		})
		return facets;
	}

	// index - convert item positions to facet binary bitmap
	function convertBitmaps(items, facets){
		items.forEach(function(item){
			Object.keys(facets).forEach(function(facetKey){
				Object.keys(facets[facetKey]).forEach(function(facet){
					var itemValues = Array.isArray(item[facetKey]) ? item[facetKey] : [ item[facetKey] ];
					if(itemValues.indexOf(facet) > -1){
						facets[facetKey][facet].bitmap = '1' + facets[facetKey][facet].bitmap;
					} else {
						facets[facetKey][facet].bitmap = '0' + facets[facetKey][facet].bitmap;
					}
				})
			})
		})
		return facets;
	}

	// index - convert binary bitmaps to big int string
	function convertBigInt(facets){
		Object.keys(facets).forEach(function(facetKey){
			Object.keys(facets[facetKey]).forEach(function(facet){
				facets[facetKey][facet].bitmap = bigInt(facets[facetKey][facet].bitmap, 2).toString();
			})
		})
		return facets
	}

	// results - deep traverse an object (recursive)
	function traverse(node, callback, path, level){
		if(node.hasOwnProperty("bitmap")){
			return callback(node, path, level)
		} else {
			Object.keys(node).forEach(function(key){
				var nodePath = path ? path+"."+key: key;
				var nodeLevel = level ? level + 1 : 0;
				node[key] = traverse(node[key], callback, nodePath, nodeLevel)
			})
			return node;
		}
	}

	// results - compute bitmap value based on active filters
	function getBitmap(index, length){
		// return nested function result
		return andCategories(index, length);
		// nested function, traverse categories, use AND logic on each
		function andCategories(categories, length){
			var allOnes = bigInt(1).shiftLeft(length).minus(1);
			return _.values(categories).reduce(function(accumulator, filters){
				var rslt = orFilters(filters);
				// If rslt contains matches, return matches, else match all.
				rslt = rslt.value ? rslt : allOnes;
				return accumulator.and(rslt);
			}, allOnes);
		}
		// nested function - traverse filter items, use OR logic on each (recursive)
		function orFilters(filters){
			return _.values(filters).reduce(function(accumulator, filter){
				if (filter.hasOwnProperty('status') && (bigInt.isInstance(filter.status[0]) || Array.isArray(filter.status))){
					return accumulator.or(filter.status[0] || bigInt(0));
				} else {
					return accumulator.or(orFilters(filter) || bigInt(0));
				}
			}, bigInt(0));
		}
	}

	// internal - build index
	var _default = {
		facets: {},
		items: {}
	}
	var _index = deepClone(config) || _default;
	if (!importing){
		_index.facets = buildFacets(_index.items, _index.facets);
		_index.facets = convertBitmaps(_index.items, _index.facets);
		_index.facets = convertBigInt(_index.facets);
	}
	var _results = deepClone(_index) || _default;

	// external - build results
	this.search = function search(facets){
		_results.facets = traverse(_index.facets, function(node, path, level){
			 return node
		})
		return _results;
	};
	
};

module.exports = exports = Constructor;