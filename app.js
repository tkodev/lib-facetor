// ****************************************************************************************************
// Init
// ****************************************************************************************************

var Facets = require('./index.js')
var catalogFacets = new Facets()


// ****************************************************************************************************
// Create index
// ****************************************************************************************************

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
		},
		{
			title: ["rural", "urban", "misc"],
			category: ["stroller","locks"]
		}
	]
});


// ****************************************************************************************************
// Import / Export Index
// ****************************************************************************************************
	
var index = catalogFacets.export();
catalogFacets.import(index);

// get results
var results = catalogFacets.results({
	facets: ["title"],
	operators: ["AND", "OR"],
	attributes: ["count"]
});

// log results with tab spacing
console.log(JSON.stringify(results, null, "\t"));