// ****************************************************************************************************
// Init
// ****************************************************************************************************

var bigInt = require('big-integer')

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
			if(Object.keys(obj).indexOf(path[i]) > -1){
				obj = obj[path[i]];
			}
		}
		if(Object.keys(obj).indexOf(path[i]) > -1){
			obj[path[i]] = val;
		}
	}

	// shared - Get an object's deep nested property based on "." delimited string path
	function getNode(obj, path){
		for (var i=0, path=path.split('.'), len=path.length; i<len; i++){
			if(Object.keys(obj).indexOf(path[i]) > -1){
				obj = obj[path[i]];
			}
		};
		return obj;
	};


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
			Object.keys(index).forEach(function(facet){
				Object.keys(index[facet]).forEach(function(value){
					var values = Array.isArray(item[facet]) ? item[facet] : [item[facet]];
					var bitmap = values.indexOf(value) > -1 ? '1' : '0';
					rslt[facet][value]._bitmap = rslt[facet][value]._bitmap + bitmap;
				})
			})
		})
		return rslt;
	}

	// expose - build function
	this.build = function(params){
		store.index = buildIndex(store.index, params.facets, params.items);
		store.index = populateIndexValues(store.index, params.items);
		store.items = params.items;
	}


	// ****************************************************************************************************
	// import / export
	// ****************************************************************************************************
	
	// expose - export function
	this.export = function(){
		// console.log(JSON.stringify(store, null, "\t"));
		return deepClone(store);
	}

	// expose - import function
	this.import = function(params){
		store = deepClone(params);
	}


	// ****************************************************************************************************
	// create results
	// ****************************************************************************************************

	function buildItems(){
	}

	function populateIndexAttr(index){
		var rslt = index;
		return rslt;
	}

	this.results = function(params){
		// results.items = buildItems();
		// results.index = populateIndexAttr(store.index);
		return results;
	}

};

module.exports = exports = Constructor;