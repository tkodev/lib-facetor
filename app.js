var Facets = require('./index.js')

var catalogFacets = new Facets({
    facets: {
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
            category: "locks"
        },
        {
            title: "urban",
            category: "locks"
        }
    ]
});

catalogFacets.search([
    "title.rural"
])
