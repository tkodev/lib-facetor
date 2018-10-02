# Facetor
- 🔍 a NPM module for catalog style faceted filtering. Processes data for sidebar checkbox filters on product catalog / listing pages.

## USAGE

### Init Module

- Node.js
```bash
npm install facetor
```
```js
var Facetor = require('facetor')
var catalogFacetor = new Facetor();
// ...
```

- Browser
```html
<head>
    <script src="//example.com/url-to-facetor.js"></script>
    <script>
    var catalogFacetor = new Facetor();
    // ...
    </script>
</head>
```

- AMD is also supported.

### STEP 1 - Build Index

- build index using an array containing facetable attributes, and an array of items which has those attributes. Attributes in array format are supported (EX: multiple tags or multiple color, etc)
```js
// build index
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
```

### STEP 2 (optional) - Import / Export data
- You can export / import `index` into a `.json` format. If you are importing, `STEP 1` is optional.
```js
var index = catalogFacetor.export();
catalogFacetor.import(index);
```

### STEP 3 - Filter and get results

- Passing in these options
```js
var results = catalogFacetor.results({
	facets: ["title.rural", "title.misc"],
	operators: ["AND", "OR"],
	attributes: ["count", "status", "path"]
});
```

- Results in
```json
{
	"index": {
		"title": {
			"rural": {
				"_bitmap": "5",
				"_status": 1,
				"_count": 3,
				"_path": "title.rural"
			},
			"urban": {
				"_bitmap": "58",
				"_status": 0,
				"_count": 6,
				"_path": "title.urban"
			},
			"misc": {
				"_bitmap": "32",
				"_status": 1,
				"_count": 3,
				"_path": "title.misc"
			},
			"_status": 0.5,
			"_count": 6,
			"_path": "title"
		},
		"category": {
			"stroller": {
				"_bitmap": "39",
				"_status": 0,
				"_count": 4,
				"_path": "category.stroller"
			},
			"locks": {
				"_bitmap": "24",
				"_status": 0,
				"_count": 5,
				"_path": "category.locks"
			},
			"_status": 0,
			"_count": 6,
			"_path": "category"
		}
	},
	"items": [
		{
			"title": "rural",
			"category": "stroller"
		},
		{
			"title": "rural",
			"category": "stroller"
		},
		{
			"title": [
				"urban",
				"misc"
			],
			"category": [
				"stroller"
			]
		}
	]
}
```


