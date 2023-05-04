// group variant data by ids
const variantItems = [
  {
    id: "spacegrey64",
    colour: "spacegrey",
    storage: "64"
  },
  {
    id: "spacegrey256",
    colour: "spacegrey",
    storage: "256"
  },
  {
    id: "rosegold64",
    colour: "rosegold",
    storage: "64"
  },
  {
    id: "rosegold256",
    colour: "rosegold",
    storage: "256"
  }
];

// map this obj in react to dropdown elements
const groupIndexByProps = {
  colour: {
    name: "Colour",
    curValue: "rosegold",
    values: {
      rosegold: {
        pos: [2, 3],
        posBitmap: "0011" // bitmap representation of index position of item in variant items array
      },
      spacegrey: {
        pos: [0, 1],
        posBitmap: "1100"
      }
    }
  },
  storage: {
    name: "Storage in GB",
    curValue: "64",
    values: {
      64: {
        pos: [0, 2],
        posBitmap: "1010"
      },
      256: {
        pos: [1, 3],
        posBitmap: "0101"
      }
    }
  }
};

// Possible solution with this data structure:
// - Compare array position bitmaps with binary operators to filter out a product.
// - Example:
//   - Binary Logic: rosegold.posBitmap AND 64.posBitmap = "0011" AND "1010" = "0010" bitmap = a product with index of 2 = allVariantItems[2]
//   - Binary Logic: rosegold.posBitmap AND 256.posBitmap = "0011" AND "0101" = "0001" bitmap = a product with index of 3 = allVariantItems[3]
// - Pros:
//   - Easy to render
//   - Far less expensive (selected color position AND storage position) * every possible value
//     - Grouping props by Id can be done by a Map or a dictionary {} object.
//     - Position index to bitmap is cheap
//     - Binary operations are cheap.
//   - Much easier to configure binary operator between property types and even between property values
//   - Can return multiple products.
// - Cons:
//   - Variant property key must be unique
//   - Harder to understand
