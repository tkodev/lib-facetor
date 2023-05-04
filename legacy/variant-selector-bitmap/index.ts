// dependencies
import { uniqBy as _uniqBy } from "lodash";
import bigInt from "big-integer";

// delete an entry from an array by idx
const delIdxFromArray = (items, index) => {
  return [...items.slice(0, index), ...items.slice(index + 1)];
};

// build a facet by iterating through items, each digit representing an item position and whether it matches the key-value pair (1 for match, 0 for no match)
const buildFacet = (items, key, value) => {
  const facet = bigInt(
    items
      .map(item => (item[key] === value ? 1 : 0))
      .reverse()
      .join("")
  );
  return facet;
};

// consolidate an array of facets using the AND operator
const buildFacetFromArrByAnd = (itemsLength, facetsArr) => {
  const fullFacet = bigInt(1)
    .shiftLeft(itemsLength)
    .minus(1);
  const filterFacet = facetsArr.reduce((rslt, facet) => {
    return rslt.and(facet);
  }, fullFacet);
  return filterFacet;
};

// filter items by index
const filterItemsByIndex = (items, indexes) => {
  const filteredItems = items.filter((_, idx) => {
    return indexes.and(bigInt(1).shiftLeft(idx)) > 0;
  });
  return filteredItems;
};

// resolve index to a item id
const resolveFacetsToId = (items, facets) => {
  const finalFacet = buildFacetFromArrByAnd(items.length, facets);
  const filteredItems = filterItemsByIndex(items, finalFacet);
  return filteredItems[0] ? filteredItems[0].id : 0;
};

const getFacetsWithoutKey = (facetsArr, key) => {
  const offendingIdx = facetsArr.findIndex(facet => facet.key === key);
  const facetsWithoutKey = delIdxFromArray(facetsArr, offendingIdx).map(
    ({ facet }) => facet
  );
  return facetsWithoutKey;
};

// build dropdown values based for current key. retrieve values from
const buildDropdownValues = (items, uniqueValues, currentFacets, key) => {
  const facets = uniqueValues.map(value => {
    const currentFacet = buildFacet(items, key, value);
    const currentFacetsWithoutKey = getFacetsWithoutKey(currentFacets, key);
    const allFacets = [currentFacet, ...currentFacetsWithoutKey];
    const productId = resolveFacetsToId(items, allFacets);
    const valueObj = {
      value,
      productId
    };
    return valueObj;
  });
  return facets;
};

// collect unique values from items
const collectValuesFromItems = (items, key) => {
  const uniqueValues = _uniqBy(items, item => item[key]).map(item => item[key]);
  return uniqueValues;
};

// export methods
export const createDropdownArr = (items, allowedFields, currentFields) => {
  console.log(allowedFields);
  // build facet for each key in currentFields
  const currentFacets = currentFields.map(({ key, value }) => ({
    key,
    facet: buildFacet(items, key, value)
  }));
  // build dropdowns array based on allowedFields
  const dropdowns = allowedFields.map(({ key, name }) => {
    const uniqueValues = collectValuesFromItems(items, key);
    const values = buildDropdownValues(items, uniqueValues, currentFacets, key);
    const dropdown = {
      key,
      name,
      values
    };
    return dropdown;
  });
  return dropdowns;
};
