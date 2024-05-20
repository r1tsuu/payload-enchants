import type { CollectionConfig } from 'payload/types';

import type { SanitizedArgsContext } from '../types';

export const extendCollectionConfig = ({
  collection,
  ctx,
}: {
  collection: CollectionConfig;
  ctx: SanitizedArgsContext;
}): CollectionConfig => {
  const { slug } = collection;

  return {
    ...collection,
    hooks: {
      ...(collection.hooks ?? {}),
      afterChange: [
        ...(collection.hooks?.afterChange ?? []),
        async (hookArgs) => {
          if (!!hookArgs.doc?.id) return;
          const shouldValidate = await ctx.shouldRevalidateOnChange(hookArgs);

          if (!shouldValidate) return;

          ctx.revalidateTag(ctx.buildTagFindByID({ id: hookArgs.doc.id, slug }));
          ctx.revalidateTag(ctx.buildTagFind({ slug }));
        },
      ],
      afterDelete: [
        ...(collection.hooks?.afterDelete ?? []),
        async (hookArgs) => {
          if (!!hookArgs.doc?.id) return;
          const shouldValidate = await ctx.shouldRevalidateOnDelete(hookArgs);

          if (!shouldValidate) return;

          ctx.revalidateTag(ctx.buildTagFindByID({ id: hookArgs.doc.id, slug: slug as string }));
          ctx.revalidateTag(ctx.buildTagFind({ slug }));
        },
      ],
    },
  };
};
