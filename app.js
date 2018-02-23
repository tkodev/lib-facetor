var Facets = require('./index.js')

var facetable = [
    "title",
    "category"
}
var products = [
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
var boolean = ["AND", "OR"]
var catalogFacets = new Facets({facetable, products, boolean});

catalogFacets.search([
    "title.rural"
])
