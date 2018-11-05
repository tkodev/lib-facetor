// ****************************************************************************************************
// Init dependencies and constructor
// ****************************************************************************************************

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
			// AMD
			define(['big-integer'], factory);
	} else if (typeof exports === 'object') {
			// Node, CommonJS-like
			module.exports = factory(require('big-integer'));
	} else {
			// Browser globals (root is window)
			root.returnExports = factory(root.bigInt);
	}
}(this, function (bigInt) {
	return function() {

		// ****************************************************************************************************
		// init constructor scope variables
		// ****************************************************************************************************
	
		var index = {};
		var result = {};


		// ****************************************************************************************************
		// shared functions
		// ****************************************************************************************************

		// deep clone an object
		function deepClone(obj) {
			return obj ? JSON.parse(JSON.stringify(obj)) : null;
		}

		// map object - replica of underscore's mapObject, operates like array.map
		function mapObject(obj, iterator, initialValue) {
			var rslt = deepClone(obj);
			Object.keys(rslt).forEach(function(key){
				var value = rslt[key];
				rslt[key] = iterator(value, key, rslt)
			})
			return rslt;
		}

		// reduce object - similar to underscore's mapObject, but operates like array.reduce
		function reduceObject(obj, iterator, initialValue) {
			var rslt = deepClone(obj);
			return Object.keys(rslt).reduce(function (accumulator, currentKey) {
				var currentValue = rslt[currentKey];
				return iterator(accumulator, currentValue, currentKey, rslt)
			}, initialValue)
		}


		// ****************************************************************************************************
		// build index
		// ****************************************************************************************************

		// build index base object based on facets
		function getBaseData(rslt, params){
			params.facets.forEach(function (key) {
				rslt[key] = {};
				params.items.forEach(function (item) {
					if (item[key]) {
						var values = Array.isArray(item[key]) ? item[key] : [item[key]];
						values.forEach(function (value) {
							if(params.blacklist && params.blacklist.indexOf(value) > -1){
							} else {
								rslt[key][value] = '';
							}
						});
					}
				})
			});
			return rslt
		}

		// populate index by converting item positions to bitmap
		function populateBaseData(rslt, params){
			return mapObject(rslt, function (category, categoryKey) {
				return mapObject(category, function (bitmap, fieldKey) {
					params.items.forEach(function(item){
						var itemValues = Array.isArray(item[categoryKey]) ? item[categoryKey] : [item[categoryKey]];
						var itemBitmap = itemValues.indexOf(fieldKey) > -1 ? '1' : '0';
						bitmap = itemBitmap + bitmap;
					})
					return bitmap
				});
			});
		}

		// convert binary bitmap to base 10 string
		function convertBaseData(rslt){
			return mapObject(rslt, function (category, categoryKey) {
				return mapObject(category, function (bitmap, fieldKey) {
					return bigInt(bitmap, 2).toString();
				});
			});
		}

		// build index obj based on item facet values
		function buildIndexData(params) {
			var rslt = {}
			rslt = getBaseData(rslt, params);
			rslt = populateBaseData(rslt, params);
			rslt = convertBaseData(rslt);
			return rslt;
		}

		
		// ****************************************************************************************************
		// build results
		// ****************************************************************************************************

		// evaluate child bitmaps using operator
		function evalBitmap(operator, obj, key, facets, length){
			var baseBitmap = operator == "and" ? bigInt(1).shiftLeft(length).minus(1) : bigInt(0);
			return reduceObject(obj, function(rslt, bitmap, childKey){
				var path = key ? key + "." + childKey: childKey;
				if(operator == "and"){
					return bitmap != "0" ? rslt.and(bitmap) : rslt;
				} else {
					return facets.indexOf(path) > -1 ? rslt.or(bitmap) : rslt;
				}
			}, baseBitmap)
		}

		// get count of current bitmap
		function getCount(bitmap){
			var tempBitmap = bigInt(bitmap.toString());
			var rslt = 0
			while (tempBitmap > 0) {
				tempBitmap = tempBitmap.and(tempBitmap.minus(1));
				rslt++;
			}
			return rslt;
		}

		// get full bitmap of index based on current facets
		function getBitmap(index, facets){
			var length = index.items.length
			var categoryBitmaps = mapObject(index.data, function(category, categoryKey){
				return evalBitmap("or", category, categoryKey, facets, length);
			})
			return evalBitmap("and", categoryBitmaps, null, facets, length)
		}

		// build result data
		function buildResultData(index, params, baseBitmap){
			var baseCount = params.facets.length ? getCount(baseBitmap) : 0;
			return mapObject(index.data, function(category, categoryKey){
				return mapObject(category, function(field, fieldKey){
					field = {};
					var path = categoryKey + "." + fieldKey;
					var bitmap = getBitmap(index, params.facets.concat([path]))
					var count = getCount(bitmap);
					if(params.attributes.indexOf("path") > -1){
						field.path = path;
					}
					if(params.attributes.indexOf("bitmap") > -1){
						field.bitmap = bitmap;
					}
					if(params.attributes.indexOf("count") > -1){
						field.count = count;
					}
					if(params.attributes.indexOf("increment") > -1){
						field.increment = count - baseCount;
					}
					if(params.attributes.indexOf("status") > -1){
						field.status = params.facets.indexOf(path) > -1
					}
					return field
				})
			})
		}

		// build result items
		function buildResultItems(index, baseBitmap){
			return index.items.filter(function(elem, idx){
				return baseBitmap.and(bigInt(1).shiftLeft(idx)) > 0;
			});
		}


		// ****************************************************************************************************
		// expose functions
		// ****************************************************************************************************

		// expose - build index
		this.buildIndex = function (params) {
			index = {
				data: buildIndexData(params),
				items: deepClone(params.items)
			};
		};

		// expose - build result
		this.buildResult = function (params) {
			var bitmap = getBitmap(index, params.facets);
			result = {
				data: buildResultData(index, params, bitmap),
				items: buildResultItems(index, bitmap)
			}
			return result;
		};

		// expose - import index
		this.importIndex = function (params) {
			index = deepClone(params);
		};

		// expose - export index
		this.exportIndex = function () {
			return deepClone(index);
		};

	};
}));


