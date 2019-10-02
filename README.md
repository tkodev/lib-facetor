# Facetor
- 🔍 Facetor - NPM module to filter a list of objects by its fields. Useful for e-commerce style catalog pages.
- Version 2.x.x has arrived! with some major breaking changes


## USAGE
- Facetor has two steps:
	- Build Index, by specifying array of Items to filter and the Items' filterable fields.
	- Build Results, from array of field.values to return, and array of attributes returned for each field.


### Prep - Load the module
Let's load the module
- On Node.js / CommonJS:
  - in terminal: `npm install facetor`
  - in node: `var Facetor = require('facetor')`
- On the browser - html:
  - in html head tag: 
	- BigInteger.js: `<script src="//example.com/biginteger.js"></script>`
	- Facetor.js: `<script src="//example.com/facetor.js"></script>`
- AMD is also supported.


### Step 1
Build Index, by specifying array of Items to filter and the Items' filterable fields.
- EX: Here, we want to make the fields "style" and "category" available for filtering later:
```js
var catalogFacetor = new Facetor();
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
```


### Step 2
Build Results, from array of field.values, and array of attributes returned for each field.
- Values in the same parent fields use "OR" binary logic, while fields use "AND" logic.
- EX: Here, we want to only get "style.rural" and "category.oranges" items.
```js
var result = catalogFacetor.buildResult({
	facets: ["style.rural", "category.oranges"],
	attributes: ["path", "bitmap", "count", "increment", "status"]
});
```
- Results in
```json
{
	"data": {
		"style": {
			"rural": {
				"path": "style.rural",
				"bitmap": "20",
				"count": 2,
				"increment": 0,
				"status": true
			},
			"urban": {
				"path": "style.urban",
				"bitmap": "28",
				"count": 3,
				"increment": 1,
				"status": false
			}
		},
		"category": {
			"apples": {
				"path": "category.apples",
				"bitmap": "21",
				"count": 3,
				"increment": 1,
				"status": false
			},
			"oranges": {
				"path": "category.oranges",
				"bitmap": "20",
				"count": 2,
				"increment": 0,
				"status": true
			},
			"apple": {
				"path": "category.apple",
				"bitmap": "20",
				"count": 2,
				"increment": 0,
				"status": false
			}
		}
	},
	"items": [
		{
			"title": "Rural Orange",
			"style": "rural",
			"category": "oranges"
		},
		{
			"title": "A mega rural urban apple orange hybrid",
			"style": [
				"rural",
				"urban"
			],
			"category": [
				"apple",
				"oranges"
			]
		}
	]
}
```

### Import and Export
Allows building of index ahead of time to save cpu and memory.
- Export current index
```js
  var indexJSON = catalogFacetor.exportIndex();
```
- Import index from json object
```js
  var newCatalogFacetor = new Facetor();
  newCatalogFacetor.importIndex(indexJSON); // exported from above
  var results = newCatalogFacetor.buildResult({
    facets: ["style.rural", "category.oranges"],
    attributes: ["path", "bitmap", "count", "increment", "status"]
  });
  // same results as step 2
```


