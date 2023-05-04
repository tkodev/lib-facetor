const product = {
  id: "rosegold64",
  variant_properties: [
    // array of properties
    {
      summary: {
        key: "colour",
        name: "Colour",
        value: "rosegold"
      },
      other_variants: [
        // array of variant items and their values
        {
          variantId: "rosegold256",
          value: "rosegold"
        },
        {
          variantId: "spacegrey256",
          value: "spacegrey"
        },
        {
          variantId: "spacegrey64",
          value: "spacegrey"
        }
      ]
    },
    {
      summary: {
        key: "storage",
        name: "Storage in GB",
        value: "64"
      },
      other_variants: [
        // array of variant items and their values
        {
          variantId: "rosegold256",
          value: "256"
        },
        {
          variantId: "spacegrey256",
          value: "256"
        },
        {
          variantId: "spacegrey64",
          value: "64"
        }
      ]
    }
  ]
};

// object is too large
// current product is not included in variants
// how data maps or renders into the ui view is unclear and inefficient
