var Facets = require('./index.js')

var catalogFacets = new Facets({
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

var results = catalogFacets.search({
    facets: ["index.title"],
    boolean: ["AND", "OR"]
});
// console.log(JSON.stringify(results.index, null, "\t"));