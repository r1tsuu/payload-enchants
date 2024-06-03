import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload/types';

import type { SanitizedArgsContext } from '../types';

const buildFindOneTags = ({
  cachedCollectionConfig,
  collection: { slug },
  ctx,
  hookArgs,
}: {
  cachedCollectionConfig: SanitizedArgsContext['collections'][0];
  collection: CollectionConfig;
  ctx: SanitizedArgsContext;
  hookArgs: Parameters<CollectionAfterChangeHook | CollectionAfterDeleteHook>[0];
}) => {
  const previousDoc = (hookArgs as Parameters<CollectionAfterChangeHook>[0]).previousDoc;

  return cachedCollectionConfig.findOneFields
    .map((field) => {
      const currentTag = ctx.buildTagFindOne({
        fieldName: field.name,
        slug,
        value: field.getFieldFromDoc(hookArgs.doc),
      });

      const tags: string[] = [currentTag];

      if (previousDoc) {
        const previousTag = ctx.buildTagFindOne({
          fieldName: field.name,
          slug,
          value: field.getFieldFromDoc(previousDoc),
        });

        if (currentTag !== previousDoc) tags.push(previousTag);
      }

      return tags;
    })
    .flat();
};

const executeSingleDocHook = ({
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
  if (!hookArgs.doc.id) return;

  const { slug } = collection;

  let operation: 'CREATE' | 'DELETE' | 'UPDATE';

  if (type === 'afterDelete') operation = 'DELETE';
  else if ((hookArgs as Parameters<CollectionAfterChangeHook>[0]).operation === 'create')
    operation = 'CREATE';
  else operation = 'UPDATE';

  const tags = [
    ctx.buildTagFindByID({ id: hookArgs.doc.id, slug: slug as string }),
    ...buildFindOneTags({ cachedCollectionConfig, collection, ctx, hookArgs }),
  ];

  ctx.revalidateTags({
    operation,
    payload: hookArgs.req.payload,
    tags,
  });
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
          if (!(await ctx.shouldRevalidateOnChange(hookArgs))) return;

          executeSingleDocHook({
            cachedCollectionConfig,
            collection,
            ctx,
            hookArgs,
            type: 'afterChange',
          });

          ctx.revalidateTags({
            operation: 'UPDATE-BULK',
            payload: hookArgs.req.payload,
            tags: [ctx.buildTagFind({ slug: collection.slug })],
          });
        },
      ],
      afterDelete: [
        ...(collection.hooks?.afterDelete ?? []),
        async (hookArgs) => {
          if (!(await ctx.shouldRevalidateOnDelete(hookArgs))) return;

          executeSingleDocHook({
            cachedCollectionConfig,
            collection,
            ctx,
            hookArgs,
            type: 'afterDelete',
          });

          ctx.revalidateTags({
            operation: 'DELETE-BULK',
            payload: hookArgs.req.payload,
            tags: [ctx.buildTagFind({ slug: collection.slug })],
          });
        },
      ],
    },
  };
};
