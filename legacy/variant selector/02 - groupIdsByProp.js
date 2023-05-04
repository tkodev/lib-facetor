// map this obj in react to dropdown elements
const groupIdsByProps = {
  colour: {
    name: "Colour",
    curValue: "rosegold",
    variantIds: {
      rosegold: ["rosegold64", "rosegold256"],
      spacegrey: ["spacegrey256", "spacegrey64"]
    }
  },
  storage: {
    name: "Storage in GB",
    curValue: "64",
    variantIds: {
      64: ["rosegold64", "spacegrey64"],
      256: ["spacegrey256", "rosegold256"]
    }
  }
};

// Possible solution with this data structure:
// - Comparing arrays between prop types 'colour and 'storage', return a common id.
// - Pros:
//   - Easy to render
//   - Easy to understand
// - Cons:
//   - Variant property key must be unique
//   - Very Expensive, especially when calculating which fields are invalid/disabled
//     - Calculation: color id arr * storage id arr * every possible values to determine if value has valid products = x*y*(x+y) )
//   - Cannot translate to a checkbox / catalog listing based solution, different binary logic between prop types and values (not configurable)

// Notes:
// - Why not just return the first id on the selected value?
//   - When selecting a new 'colour', the returned ID may not match 'storage' value of current product.
