

function Constructor(input) {
    // define functions
    function deepClone(obj){
        return obj ? JSON.parse(JSON.stringify(obj)) : null;
    }
    function traverse(node, callback, path){
        if(!Array.isArray(node) && typeof node == "object" && Object.keys(node).length){
            Object.keys(node).forEach(function(key){
                var nodePath = path ? path+"."+key: key
                node[key] = traverse(node[key], callback, nodePath)
            })
            return node;
        } else {
            return callback(node, path)
        }
    }
    // add to prototype
    this.traverse = traverse;
    this._input = input || {
        facetable: [],
        items: [],
        boolean: []
     };
    this._index = {};
    this._results = {};
    // build store
    // feedback
    console.log("[init input]", this._input);
    console.log("[init index]", this._index);
    console.log("[init ouput]", this._output);
};

Constructor.prototype.search = function(facets){
    console.log("[facets]", facets);
    // build store
    // this._results = this.traverse(this._store.index, function(node, path){
    //     console.log(node, path);

    //     return node
    // })
    console.log("[results]", this._results);
    return this._results;
}

module.exports = exports = Constructor;