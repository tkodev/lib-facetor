// ****************************************************************************************************
// Init
// ****************************************************************************************************

var bigInt = require('big-integer')
var _ = require('underscore')

function Constructor() {

	// ****************************************************************************************************
	// shared functions
	// ****************************************************************************************************

	// shared - deep clone an object
	function deepClone(obj) {
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
	}

	// shared - Set an object's deep nested property based on "." delimited string path
	function setNode(obj, path, val) {
		path = path.split('.');
		for (i = 0; i < path.length - 1; i++) {
			if (_.keys(obj).indexOf(path[i]) > -1) {
				obj = obj[path[i]];
			}
		}
		if (_.keys(obj).indexOf(path[i]) > -1) {
			obj[path[i]] = val;
		}
	}

	// shared - Get an object's deep nested property based on "." delimited string path
	function getNode(obj, path) {
		for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
			if (_.keys(obj).indexOf(path[i]) > -1) {
				obj = obj[path[i]];
			}
		};
		return obj;
	};

	// shared - reduce object using its keys - very similar to reduce for arrays
	// syntax:
	// 	_.reduceObject(obj, function(accumulator, currentValue, currentKey, self){
	// 		return accumulator
	// 	}, initialValue)
	_.reduceObject = function (obj, callback, initialValue) {
		return _.keys(obj).reduce(function (accumulator, currentKey) {
			var currentValue = obj[currentKey];
			return callback(accumulator, currentValue, currentKey, obj)
		}, initialValue)
	}


	// ****************************************************************************************************
	// init constructor scope variables
	// ****************************************************************************************************

	var store = {
		index: {},
		items: []
	};
	var results = {
		index: {},
		items: []
	}


	// ****************************************************************************************************
	// build index
	// ****************************************************************************************************

	// build index based on item facet values
	function buildStoreIndex(store, params) {
		var rslt = store.index
		params.facets.forEach(function (facetKey) {
			rslt[facetKey] = {};
			params.items.forEach(function (item) {
				if (item[facetKey]) {
					var values = Array.isArray(item[facetKey]) ? item[facetKey] : [item[facetKey]];
					values.forEach(function (value) {
						rslt[facetKey][value] = { _bitmap: '' };
					});
				}
			})
		});
		// populate index by converting item positions to bitmap
		rslt = _.mapObject(rslt, function (facet, facetKey) {
			return _.mapObject(facet, function (value, valueKey) {
				params.items.forEach(function (item) {
					var values = Array.isArray(item[facetKey]) ? item[facetKey] : [item[facetKey]];
					var exist = values.indexOf(valueKey) > -1 ? '1' : '0';
					value._bitmap = exist + value._bitmap;
				})
				return value
			});
		});
		// convert binary bitmap to base 10 string
		rslt = _.mapObject(rslt, function (facet, facetKey) {
			return _.mapObject(facet, function (value, valueKey) {
				var bitmap = bigInt(value._bitmap, 2).toString();
				value._bitmap = bitmap
				return value
			});
		});
		return rslt;
	}

	// expose - build function
	this.build = function (params) {
		store.index = buildStoreIndex(store, params);
		store.items = deepClone(params.items);
		return store;
	}


	// ****************************************************************************************************
	// import / export
	// ****************************************************************************************************

	// expose - export function
	this.export = function () {
		// console.log(JSON.stringify(store, null, "\t"));
		return deepClone(store);
	}

	// expose - import function
	this.import = function (params) {
		store = deepClone(params);
	}


	// ****************************************************************************************************
	// create results
	// ****************************************************************************************************

	// get config for bitmap node
	function getBitmapCfg(operators, level, length, facets) {
		var operator = ["AND", "OR"].indexOf(operators[level]) > -1 ? operators[level] : "AND";
		var cfg = {
			"AND": {
				initial: bigInt(1).shiftLeft(length).minus(1),
				operation: function (operand1, operand2) { return operand1.and(operand2) }
			},
			"OR": {
				initial: bigInt(0),
				operation: function (operand1, operand2) { return operand1.or(operand2) }
			}
		}
		return {
			operator: operator,
			operation: cfg[operator].operation,
			initial: cfg[operator].initial
		}
	}

	// get bitmap
	function getBitmap(index, params, path) {
		var level = ((path.match(/\./g) || []).length + 1);
		var bitmapCfg = getBitmapCfg(params.operators, level, store.items.length);
		var rslt = _.reduceObject(index, function (accumulator, node, nodeKey) {
			// Recursively deep reduce all of node's children. On each level, operate on bitmap if nodePath is related to any item in facets param.
			var nodePath = path ? path + "." + nodeKey : nodeKey;
			var bitmap = node.hasOwnProperty("_bitmap") ? bigInt(node._bitmap) : getBitmap(node, params, nodePath);
			var related = _.findIndex(params.facets, function (facet) {
				return nodePath.indexOf(facet) == 0 || facet.indexOf(nodePath) == 0;
			}) > -1;
			return related ? bitmapCfg.operation(accumulator, bitmap) : accumulator;
		}, bitmapCfg.initial)
		// avoid empty OR results
		if (bitmapCfg.operator == "OR") {
			rslt = rslt.value ? rslt : bigInt(1).shiftLeft(store.items.length).minus(1);
		}
		return rslt;
	}

	// build items based on bitmap values
	function buildResultsItems(store, params) {
		var bitmap = getBitmap(store.index, params, "")
		var rslt = store.items.filter(function (elem, idx) {
			return bitmap.and(bigInt(1).shiftLeft(idx)) > 0;
		})
		return rslt;
	}

	// build bitmap count
	function getCount(bitmap){
		var rslt = 0;
		while (bitmap > 0) {
			// Count all the 1s in curBitmap, which is the count of matched products
			bitmap = bitmap.and(bitmap.minus(1));
			rslt++;
		}
		return rslt;
	}

	// populate index based on store.index with attributes
	function populateResultsIndex(index, store, params, path) {
		var rslt = _.mapObject(index, function (node, nodeKey) {
			// Recursively deep map all of node's children. On each level, populate attributes if params.attributes asks for it.
			var nodePath = path ? path + "." + nodeKey : nodeKey;
			var tempParams = deepClone(params);
			tempParams.facets = params.facets.concat([nodePath])
			node = node.hasOwnProperty("_bitmap") ? node : populateResultsIndex(node, store, params, nodePath);
			if (params.attributes.indexOf("status") > -1){
				// true or false
				var status = _.findIndex(params.facets, function (facet) {
					return nodePath.indexOf(facet) == 0;
				}) > -1 ? 1 : 0;
				// indeterminate status
				if(!status && !node.hasOwnProperty("_bitmap")){
					var length = _.keys(node).filter(function(key){
						return key.indexOf("_") != 0;
					}).length
					status = _.reduceObject(node, function(accumulator, val, key){
						return accumulator + (val.hasOwnProperty("_status") ? val._status : 0);
					}, 0);
					if(status){
						status = status == length ? 1 : 0.5;
					}
				}
				node._status = status;
			}
			if (params.attributes.indexOf("count") > -1){
				var bitmap = getBitmap(store.index, tempParams, "")
				node._count = getCount(bitmap);
			}
			return node;
		})
		return rslt;
	}

	this.results = function (params) {
		results.items = buildResultsItems(store, params);
		results.index = populateResultsIndex(store.index, store, params, "")
		return results;
	}

};

module.exports = exports = Constructor;