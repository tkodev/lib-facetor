// dependencies
import {
  uniq as _uniq,
  compact as _compact,
  flatten as _flatten,
  groupBy as _groupBy
} from "lodash";
import { RoItem } from "api-data-util";
import { ItemVariant } from "api-data-util/dist/types/models/items/item-variant.model";

// local dependencies
import { Product } from "./product-details.types";

// init methods
const getProductPrice = (roItem: RoItem): string => {
  return roItem.itemDetail.pricing && roItem.itemDetail.pricing.isOnSale
    ? roItem.itemDetail.pricing.salePrice.toString()
    : roItem.itemDetail.pricing.regularPrice.toString();
};
const collectVariantIds = (
  curId: number,
  variantProperties: ItemVariant[]
): number[] => {
  const allVariantIds = variantProperties.map(({ otherVariants = [] }) =>
    otherVariants.map(variant => variant.variantId)
  );
  const rslt = _uniq(_compact(_flatten([curId, ...allVariantIds])));
  return rslt;
};

const addIdtoPropsDict = (dict, key, value, id) => {
  dict[key] = dict[key] ?? {};
  dict[key][value] = dict[key][value] ?? [];
  dict[key][value] = [...dict[key][value], id];
  return dict;
};

const collectVariantIdsByProps = (
  curId: number,
  variantProperties: ItemVariant[]
) => {
  let propsDict = {};
  variantProperties.forEach(property => {
    // add current product properties
    propsDict = addIdtoPropsDict(
      propsDict,
      property.summary.key,
      property.summary.value,
      curId
    );
    // all variant product properties
    property.otherVariants.forEach(variantItem => {
      propsDict = addIdtoPropsDict(
        propsDict,
        property.summary.key,
        variantItem.value,
        variantItem.variantId
      );
    });
  });
  console.log(propsDict);
  return propsDict;
};

// export methods
export const getTransformedProduct = (roItem: RoItem): Product => {
  const price = getProductPrice(roItem);
  const variantIds = collectVariantIds(
    roItem.itemDetail.id,
    roItem.itemDetail.variantProperties
  );
  const variantIdsByProp = collectVariantIdsByProps(
    roItem.itemDetail.id,
    roItem.itemDetail.variantProperties
  );
  const rslt = {
    price,
    variantIds,
    variantIdsByProp,
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
    termsAndConditions: roItem.itemDetail.termsAndConditions
  };
  return rslt;
};
