// ****************************************************************************************************
// Init
// ****************************************************************************************************

var Facetor = require('./index.js')
var catalogFacetor = new Facetor()


// ****************************************************************************************************
// Build Index
// ****************************************************************************************************

catalogFacetor.buildIndex({
	facets: ["style", "category"],
	items: [
		{
			title: "Rural Apple",
			style: "rural",
			category: "apples"
		},
		{
			title: "Urban Apple",
			style: "urban",
			category: "apples"
		},
		{
			title: "Rural Orange",
			style: "rural",
			category: "oranges"
		},
		{
			title: "Urban Orange",
			style: "urban",
			category: "oranges"
		},
		{
			title: "A mega rural urban apple orange hybrid",
			style: ["rural", "urban"],
			category: ["apple", "oranges"]
		}
	]
});


// ****************************************************************************************************
// Import / Export Index
// ****************************************************************************************************
	
var index = catalogFacetor.exportIndex();
catalogFacetor.importIndex(index);


// ****************************************************************************************************
// Build Results
// ****************************************************************************************************

// get result
var result = catalogFacetor.buildResult({
	facets: ["style.rural", "category.oranges"],
	attributes: ["path", "bitmap", "count", "increment", "status"]
});

// log results with tab spacing
console.log(JSON.stringify(result, null, "\t"));