import type { CollectionBeforeValidateHook } from 'payload';

export const incrementOrder: CollectionBeforeValidateHook = async ({
  collection,
  data,
  operation,
  req,
}) => {
  if (operation === 'update') return;

  const {
    docs: [lastByOrder],
  } = await req.payload.find({
    collection: collection.slug,
    req,
    sort: '-docOrder',
  });

  return {
    ...data,
    docOrder:
      lastByOrder?.docOrder && typeof lastByOrder.docOrder === 'number'
        ? lastByOrder.docOrder + 1
        : 1,
  };
};
