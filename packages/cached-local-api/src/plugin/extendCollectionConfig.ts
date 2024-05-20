import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload/types';

import type { SanitizedArgsContext } from '../types';

const executeHook = async ({
  cachedCollectionConfig,
  collection,
  ctx,
  hookArgs,
  type,
}: {
  cachedCollectionConfig: SanitizedArgsContext['collections'][0];
  collection: CollectionConfig;
  ctx: SanitizedArgsContext;
  hookArgs: Parameters<CollectionAfterChangeHook | CollectionAfterDeleteHook>[0];
  type: 'afterChange' | 'afterDelete';
}) => {
  if (!!hookArgs.doc?.id) return;
  const shouldFunction =
    type === 'afterDelete' ? ctx.shouldRevalidateOnDelete : ctx.shouldRevalidateOnChange;

  const shouldValidate = await shouldFunction(hookArgs as any);

  if (!shouldValidate) return;

  const { slug } = collection;

  ctx.revalidateTag(ctx.buildTagFindByID({ id: hookArgs.doc.id, slug: slug as string }));
  ctx.revalidateTag(ctx.buildTagFind({ slug }));

  for (const field of cachedCollectionConfig.findOneFields) {
    const value = field.getFieldFromDoc(hookArgs.doc);

    ctx.revalidateTag(
      ctx.buildTagFindOne({
        fieldName: field.name,
        slug,
        value,
      }),
    );
  }
};

export const extendCollectionConfig = ({
  cachedCollectionConfig,
  collection,
  ctx,
}: {
  cachedCollectionConfig: SanitizedArgsContext['collections'][0];
  collection: CollectionConfig;
  ctx: SanitizedArgsContext;
}): CollectionConfig => {
  return {
    ...collection,
    hooks: {
      ...(collection.hooks ?? {}),
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        async (hookArgs) => {
          await executeHook({
            cachedCollectionConfig,
            collection,
            ctx,
            hookArgs,
            type: 'afterChange',
          });
        },
      ],
      afterDelete: [
        ...(collection.hooks?.afterDelete ?? []),
        async (hookArgs) => {
          await executeHook({
            cachedCollectionConfig,
            collection,
            ctx,
            hookArgs,
            type: 'afterDelete',
          });
        },
      ],
    },
  };
};
