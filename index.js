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
	function deepClone(obj){
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
	}

	// shared - Set an object's deep nested property based on "." delimited string path
	function setNode(obj, path, val) {
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

	// shared - Get an object's deep nested property based on "." delimited string path
	function getNode(obj, path){
		for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
			if(_.keys(obj).indexOf(path[i]) > -1){
				obj = obj[path[i]];
			}
		};
		return obj;
	};

	// shared - reduce object using its keys - very similar to reduce for arrays - syntax:
	// obj.reduceObj(function(accumulator, currentValue, currentKey, self){
	// 	return accumulator
	// }, initialValue)
	Object.prototype.reduceObj = function(callback, initialValue){
		var self = this;
		return _.keys(self).reduce(function(accumulator, currentKey){
			var currentValue = self[currentKey];
			return callback(accumulator, currentValue, currentKey, self)
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
	function buildIndex(index, facets, items){
		var rslt = index
		facets.forEach(function(facet){
			rslt[facet] = {};
			items.forEach(function(item){
				if(item[facet]){
					var values = Array.isArray(item[facet]) ? item[facet] : [item[facet]];
					values.forEach(function(value) {
						rslt[facet][value] = {_bitmap: ''};
					});
				}
			})
		});
		return rslt;
	}

	// populate index by converting item positions to bitmap
	function populateIndexValues(index, items){
		var rslt = index;
		items.forEach(function(item){
			_.keys(index).forEach(function(facet){
				_.keys(index[facet]).forEach(function(value){
					var values = Array.isArray(item[facet]) ? item[facet] : [item[facet]];
					var bitmap = values.indexOf(value) > -1 ? '1' : '0';
					rslt[facet][value]._bitmap = bitmap + rslt[facet][value]._bitmap;
				})
			})
		})
		return rslt;
	}

	// convert binary bitmap to base 10 string
	function convertIndexValues(index){
		var rslt = index;
		_.keys(index).forEach(function(facet){
			_.keys(index[facet]).forEach(function(value){
				var bitmap = bigInt(rslt[facet][value]._bitmap, 2).toString();
				rslt[facet][value]._bitmap = bitmap
			})
		})
		return rslt;
	}

	// expose - build function
	this.build = function(params){
		store.index = buildIndex(store.index, params.facets, params.items);
		store.index = populateIndexValues(store.index, params.items);
		store.index = convertIndexValues(store.index);
		store.items = params.items;
	}


	// ****************************************************************************************************
	// import / export
	// ****************************************************************************************************
	
	// expose - export function
	this.export = function(){
		console.log(JSON.stringify(store, null, "\t"));
		return deepClone(store);
	}

	// expose - import function
	this.import = function(params){
		store = deepClone(params);
	}


	// ****************************************************************************************************
	// create results
	// ****************************************************************************************************

	// get config for bitmap node
	function getBitmapCfg(operators, level, length, facets){
		var operator = ["AND", "OR"].indexOf(operators[level]) > -1 ? operators[level] : "AND";
		var cfg = {
			"AND": {
				initial: bigInt(1).shiftLeft(length).minus(1),
				operation: function(operand1, operand2){ return operand1.and(operand2) }
			},
			"OR": {
				initial: bigInt(0),
				operation: function(operand1, operand2){ return operand1.or(operand2) }
			}
		}
		return {
			operator: operator,
			operation: cfg[operator].operation,
			initial: cfg[operator].initial
		}
	}

	// get bitmap
	function getBitmap(index, path, level, length, operators, facets){
		var bitmapCfg = getBitmapCfg(operators, level, length);
		var rslt = index.reduceObj(function(accumulator, val, key){
			// set child variables
			var childPath = path ? path+"."+key : key;
			var childLevel = level + 1;
			// if child is facet, use bitmap as operand, if not, recurse and retrieve total bitmap of children;
			var operand = val.hasOwnProperty("_bitmap") ? bigInt(val._bitmap) : getBitmap(val, childPath, childLevel, length, operators, facets);
			// operate if current path is related to any facet
			var operate = _.findIndex(facets, function(facet){
				return childPath.indexOf(facet) == 0 || facet.indexOf(childPath) == 0;
			}) > -1;
			// return result
			return operate ? bitmapCfg.operation(accumulator, operand) : accumulator;
		}, bitmapCfg.initial)
		// avoid empty OR results)
		if(bitmapCfg.operator == "OR"){
			rslt = rslt.value ? rslt : bigInt(1).shiftLeft(length).minus(1);
		}
		return rslt;
	}


	function buildItems(){

	}

	function populateIndexAttr(index){
		var rslt = index;
		return rslt;
	}

	this.results = function(params){
		getBitmap(store.index, "", 0, store.items.length, params.operators, params.facets)
		// results.items = buildItems();
		// results.index = populateIndexAttr(store.index);
		return results;
	}

};

module.exports = exports = Constructor;