var bigInt = require('big-integer')

function Constructor(input) {

	// init functions
	function deepClone(obj){
		return obj ? JSON.parse(JSON.stringify(obj)) : null;
	}
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
    function search(facets){
        // console.log("[facets]", facets);
        // build store
        // _results = traverse(_store.index, function(node, path, level){
        //	 console.log(node, path);
    
        //	 return node
        // })
        // console.log("[output]", _output);
        return _output;
    }

    // init variables
	var _input = input || {
		facets: [],
		items: [],
		boolean: []
    };
	var _index = deepClone(_input) || {};
    var _output = {};

    // build index - add item facets to index facetKeys
	_index.items.forEach(function(item){
		Object.keys(_index.facets).forEach(function(facetKey){
			if(item.hasOwnProperty(facetKey)){
                var itemValues = Array.isArray(item[facetKey]) ? item[facetKey] : [ item[facetKey] ];
				itemValues.forEach(function (facet) {
                    _index.facets[facetKey][facet] = _index.facets[facetKey][facet] || {
                        bitmap: ''
                    };
                });
            }
        })
    })

    // build index - build bitmaps per subkey
    _index.items.forEach(function(item){
		Object.keys(_index.facets).forEach(function(facetKey){
            Object.keys(_index.facets[facetKey]).forEach(function(facet){
                var itemValues = Array.isArray(item[facetKey]) ? item[facetKey] : [ item[facetKey] ];
			    if(itemValues.indexOf(facet) > -1){
                    _index.facets[facetKey][facet].bitmap = '1' + _index.facets[facetKey][facet].bitmap;
                } else {
                    _index.facets[facetKey][facet].bitmap = '0' + _index.facets[facetKey][facet].bitmap;
                }
            })
        })
    })

    // build index - convert results to big int
    Object.keys(_index.facets).forEach(function(facetKey){
        Object.keys(_index.facets[facetKey]).forEach(function(facet){
            _index.facets[facetKey][facet].bitmap = bigInt(_index.facets[facetKey][facet].bitmap, 2).toString();
        })
    })
    
    // feedback
	console.log("[init input]", _input);
	console.log("[init index]", JSON.stringify(_index.facets, null, "\t"));
    console.log("[init ouput]", _output);
    
    // add to prototype
    this.search = search;

};

module.exports = exports = Constructor;