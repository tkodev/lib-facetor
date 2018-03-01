# facets.js (WIP)
- a npm / bower module for faceted filtering of an array

## USAGE
### Build index
- To initiate the module, create an obj of containing facetable attributes, and an array of items which has those attributes. 
```js
var Facets = require('facets')

// create new facets instance
var facets = new Facets({
    index: {
        "title": {},
        "category": {}
    },
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
```

### Import / Export data
- The module processes the data after init, to speed up faceting behaviour. 
- You can export / import this, making it easy to load a prebuilt index for more speed.
```js
// get instance's data (you can save this as a JSON)
var store = facets.getStore(); // gets a copy of the current

// set instance's data - create a new empty facets instance first
var facets = new Facets();
var store = facets.setStore(store);
```

### Get Results
- Supply `getResults` with:
- An array containing facet paths (`.` delimited)
- Logic perators for each level, starting with parent. Supports: `AND` and `OR` (default)
  - Following Example: `AND` will apply between parent level facets (`title`, `category`), `OR` between `rural` & `urban`, also `stroller` & `locks`
```js
// use this in your front end application
var results = facets.getResults({
    facets: ["title.rural"],
    operators: ["AND", "OR"]
});
```
- Output:
```json
{
        "title": {
                "rural": {
                        "_bitmap": "31",
                        "_count": 5
                },
                "urban": {
                        "_bitmap": "31",
                        "_count": 5
                },
                "_bitmap": "31",
                "_count": 5
        },
        "category": {
                "stroller": {
                        "_bitmap": "31",
                        "_count": 5
                },
                "locks": {
                        "_bitmap": "31",
                        "_count": 5
                },
                "_bitmap": "31",
                "_count": 5
        },
        "_bitmap": "31",
        "_count": 5
}
```


