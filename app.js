// init
var Facets = require('./index.js')
var catalogFacets = new Facets()

// build index
catalogFacets.build({
	facets: ["title", "category"],
	items: [
		{
			title: "rural",
			category: "stroller"
		},
		{
			title: "urban",
			category: "stroller"
		},
		{
			title: "rural",
			category: "stroller"
		},
		{
			title: "rural",
			category: "locks"
		},
		{
			title: "urban",
			category: "locks"
		}
	]
});

// optional import / export index json functions.
var index = catalogFacets.export();
catalogFacets.import(index);

// get results
var results = catalogFacets.results({
	facets: ["title"],
	operators: ["AND", "OR"],
	attributes: ["count"]
});

// log results with tab spacing
console.log(JSON.stringify(results.index, null, "\t"));