import type { CollectionSlug, Payload, TypedCollection } from 'payload';
import { APIError } from 'payload';

import { populateDocRelationships } from '../populate';
import type { Find, FindOneArgs, SanitizedArgsContext } from '../types';

export const buildFindOne = ({
  ctx,
  find,
  payload,
}: {
  ctx: SanitizedArgsContext;
  find: Find;
  payload: Payload;
}) => {
  return async function findOne<T extends CollectionSlug>(
    args: FindOneArgs<T>,
  ): Promise<TypedCollection[T] | null> {
    const collectionInConfig = ctx.collections.find(({ slug }) => slug === args.collection);

    if (!collectionInConfig)
      throw new APIError(
        JSON.stringify([
          {
            field: 'args.collection',
            message: 'Invalid findOne collection ' + String(args.collection),
          },
        ]),
      );

    const field = args.field
      ? collectionInConfig.findOneFields.find((each) => each.name === args.field)
      : collectionInConfig.findOneFields[0];

    if (!field)
      throw new APIError(
        JSON.stringify([{ field: 'args.field', message: 'Invalid findOne field' + args.field }]),
      );

    const shouldCache = (await ctx.shouldCacheFindOneOperation(args)) && !ctx.disableCache;

    const where = field.buildWhere({ args, fieldName: field.name, shouldCache, value: args.value });

    const fullArgs = {
      ...args,
      where,
    };

    if (!shouldCache) {
      const {
        docs: [doc],
      } = await payload.find(fullArgs);

      if (!doc) return null;

      return doc;
    }

    const locale = args.locale ?? args.req?.locale;

    const fallbackLocale = args.fallbackLocale ?? args.req?.fallbackLocale;

    const user = args.req?.user ?? args.user;

    let userKey = user;

    if (user && 'collection' in user && 'id' in user) {
      userKey = [user.collection, user.id];
    }

    const tag = ctx.buildTagFindOne({
      fieldName: field.name,
      slug: args.collection as string,
      value: args.value,
    });

    const keys = [
      args.collection,
      args.draft,
      fallbackLocale,
      locale,
      args.overrideAccess,
      userKey,
      args.showHiddenFields,
      args.sort,
      args.context,
      args.field,
      args.value,
      ctx.useSimpleCacheStrategy ? args.depth : null,
    ];

    let cacheHit = true;

    const start = Date.now();

    const doc = await ctx.unstable_cache(
      async () => {
        cacheHit = false;
        const {
          docs: [doc],
        } = await payload.find({ ...fullArgs, depth: ctx.useSimpleCacheStrategy ? args.depth : 0 });

        if (!doc) return null;

        return doc;
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.useSimpleCacheStrategy ? ctx.SIMPLE_CACHE_TAG : tag],
      },
    )();

    if (cacheHit) {
      ctx.debugLog({
        message: `Cache HIT, operation: findOne, collection: ${args.collection.toString()}, field: ${field.name}, field-value: ${args.value}`,
        payload,
      });
    } else {
      ctx.debugLog({
        message: `Cache SKIP, operation: findOne, collection: ${args.collection.toString()}, field: ${field.name}, field-value: ${args.value}, execution time - ${Date.now() - start} MS`,
        payload,
      });
    }

    if (!ctx.useSimpleCacheStrategy) {
      let depth = args.depth ?? payload.config.defaultDepth;

      if (depth > payload.config.maxDepth) {
        depth = payload.config.maxDepth;
      }

      if (depth > 0 && doc) {
        const populatedDocsMap = new Map<string, Record<string, any>>();

        const docKey = `${args.collection.toString()}-${doc.id}`;

        if (!populatedDocsMap.has(docKey)) populatedDocsMap.set(docKey, { ...doc });

        await populateDocRelationships({
          context: args.context,
          ctx,
          depth,
          docs: [{ data: doc, fields: payload.collections[args.collection].config.fields }],
          draft: args.draft,
          fallbackLocale: typeof args.fallbackLocale === 'string' ? args.fallbackLocale : undefined,
          find,
          locale: args.locale || undefined,
          payload,
          populatedDocsMap,
          req: args.req,
          showHiddenFields: args.showHiddenFields,
        });
      }
    }

    return doc;
  };
};
