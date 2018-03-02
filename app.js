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

var results = catalogFacets.getResults({
    facets: ["index.title"],
    operators: ["AND", "OR"],
    showCount: true
});
console.log(JSON.stringify(results.index, null, "\t"));