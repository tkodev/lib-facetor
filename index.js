var bigInt = require('big-integer')

function Constructor(index) {

	// init variables
	var _index = deepClone(index) || {
		facets: [],
		items: []
	};
	var _results = {};

	// deep clone an object
	function deepClone(obj){
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
    }
    
    // deep traverse objects
	function traverse(node, callback, path, level){
		if(!Array.isArray(node) && typeof node == "object" && Object.keys(node).length){
			Object.keys(node).forEach(function(key){
				var nodePath = path ? path+"."+key: key;
				var nodeLevel = level ? level + 1 : 0;
				node[key] = traverse(node[key], callback, nodePath, nodeLevel)
			})
			return node;
		} else {
			return callback(node, path, level)
		}
    }

    // build item facets into index
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

    // convert item positions to facet binary bitmap
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

    // convert binary bitmaps to big int string
    function convertBigInt(facets){
        Object.keys(facets).forEach(function(facetKey){
            Object.keys(facets[facetKey]).forEach(function(facet){
                facets[facetKey][facet].bitmap = bigInt(facets[facetKey][facet].bitmap, 2).toString();
            })
        })
        return facets
    }

    // init index
    _index.facets = buildFacets(_index.items, _index.facets);
    _index.facets = convertBitmaps(_index.items, _index.facets);
    _index.facets = convertBigInt(_index.facets);

	// search prototype
	this.search = function search(facets){
		// console.log("[facets]", facets);
		// build store
		// _results = traverse(_store.index, function(node, path, level){
		//	 console.log(node, path);
	
		//	 return node
		// })
		// console.log("[results]", _results);
		return _results;
	};
    
    // feedback
	console.log("[init index]", JSON.stringify(_index.facets, null, "\t"));
	console.log("[init results]", _results);

};

module.exports = exports = Constructor;