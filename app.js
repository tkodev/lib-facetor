// ****************************************************************************************************
// Init
// ****************************************************************************************************

var Facetor = require('./index.js')
var catalogFacetor = new Facetor()


// ****************************************************************************************************
// Create index
// ****************************************************************************************************

catalogFacetor.build({
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
			title: "urban",
			category: "locks"
		},
		{
			title: "urban",
			category: "locks"
		},
		{
			title: ["urban", "misc"],
			category: ["stroller"]
		}
	]
});


// ****************************************************************************************************
// Import / Export Index
// ****************************************************************************************************
	
var index = catalogFacetor.export();
catalogFacetor.import(index);

// get results
var results = catalogFacetor.results({
	facets: ["title.rural", "title.misc"],
	operators: ["AND", "OR"],
	attributes: ["count", "status"]
});

// log results with tab spacing
console.log(JSON.stringify(results, null, "\t"));