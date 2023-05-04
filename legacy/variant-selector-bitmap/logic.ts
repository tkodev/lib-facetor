// dependencies
import { RoItem } from 'api-data-util';
import { ItemVariant } from 'api-data-util/dist/types/models/items/item-variant.model';

// local dependencies
import { createDropdownArr } from '~/client/utils/faceted-dropdown';
import {
  VariantPropSimple,
  VariantItem,
  Product,
} from './product-details.types';

// init methods
const getProductPrice = (roItem: RoItem): string => {
  return roItem.itemDetail.pricing && roItem.itemDetail.pricing.isOnSale
    ? roItem.itemDetail.pricing.salePrice.toString()
    : roItem.itemDetail.pricing.regularPrice.toString();
};
const getVariantPropsSimple = (
  curId: number,
  variantProps: ItemVariant[]
): VariantPropSimple[] => {
  const propsCopy = [...variantProps];
  const rslt = propsCopy.map(({ summary, otherVariants }) => {
    const curItem = {
      variantId: curId,
      value: summary.value,
    };
    return {
      key: summary.key,
      name: summary.name,
      value: summary.value,
      allVariants: [curItem, ...otherVariants],
    };
  });
  return rslt;
};
const collectVariantItems = (
  variantProps: VariantPropSimple[]
): VariantItem[] => {
  const itemsDict = {};
  variantProps.forEach(({ key, allVariants }) => {
    allVariants.forEach(({ variantId, value }) => {
      itemsDict[variantId] = itemsDict[variantId] || {};
      itemsDict[variantId]['id'] = variantId;
      itemsDict[variantId][key] = value;
    });
  });
  const itemsArr = Object.keys(itemsDict).map(key => ({
    id: key,
    ...itemsDict[key],
  }));
  return itemsArr;
};
const collectAllowedFields = (variantProps: VariantPropSimple[]) => {
  const fieldsDict = {};
  variantProps.forEach(({ key, name }) => {
    fieldsDict[key] = name;
  });
  const fieldsArr = Object.keys(fieldsDict).map(key => ({
    key,
    name: fieldsDict[key],
  }));
  return fieldsArr;
};
const collectCurrentFields = (variantProps: VariantPropSimple[]) => {
  const fieldsArr = variantProps.map(({ key, value }) => ({
    key,
    value,
  }));
  return fieldsArr;
};

// export methods
export const getTransformedProduct = (roItem: RoItem): Product => {
  const price = getProductPrice(roItem);
  const variantPropsSimple = getVariantPropsSimple(
    roItem.itemDetail.id,
    roItem.itemDetail.variantProperties
  );
  const variantItems = collectVariantItems(variantPropsSimple);
  const allowedFields = collectAllowedFields(variantPropsSimple);
  const currentFields = collectCurrentFields(variantPropsSimple);
  const variantDropdowns = createDropdownArr(
    variantItems,
    allowedFields,
    currentFields
  );
  console.log({ variantPropsSimple, variantDropdowns });
  return {
    price,
    variantDropdowns,
    id: roItem.itemDetail.id,
    name: roItem.itemDetail.name,
    description: roItem.itemDetail.description,
    images: roItem.itemDetail.images.map(
      image => image.alternativeSizes[0].url
    ),
    status: roItem.itemSummary.status,
    orderToken: roItem.itemSummary.orderToken,
    model: roItem.itemDetail.model,
    specifications: roItem.itemDetail.specifications,
    fulfillmentInstructions: roItem.itemDetail.fulfillmentInstructions,
    termsAndConditions: roItem.itemDetail.termsAndConditions,
  };
};
