import type { GeneratedTypes, Payload } from 'payload';

import { populateDocRelationships } from '../populate';
import type { Find, FindArgs, SanitizedArgsContext } from '../types';

export const buildFind = ({
  ctx,
  payload,
}: {
  ctx: SanitizedArgsContext;
  payload: Payload;
}): Find => {
  return async function find<T extends keyof GeneratedTypes['collections']>(args: FindArgs<T>) {
    const shouldCache = (await ctx.shouldCacheFindOperation(args)) && !ctx.disableCache;

    if (!shouldCache) return payload.find(args);

    const locale = args.locale ?? args.req?.locale;

    const fallbackLocale = args.fallbackLocale ?? args.req?.fallbackLocale;

    const user = args.req?.user ?? args.user;

    let userKey = user;

    if (user && 'collection' in user && 'id' in user) {
      userKey = [user.collection, user.id];
    }

    const keys = [
      args.collection,
      args.draft,
      fallbackLocale,
      locale,
      args.where,
      args.limit,
      args.page,
      ctx.useSimpleCacheStrategy ? args.depth : null,
      args.pagination,
      args.overrideAccess,
      userKey,
      args.sort,
      args.showHiddenFields,
    ];

    let cacheHit = true;

    const start = Date.now();

    const result = await ctx.unstable_cache(
      () => {
        cacheHit = false;

        return payload.find({ ...args, depth: ctx.useSimpleCacheStrategy ? args.depth : 0 });
      },
      [JSON.stringify(keys)],
      {
        tags:
          args.tags ?? ctx.useSimpleCacheStrategy
            ? [ctx.SIMPLE_CACHE_TAG]
            : [ctx.buildTagFind({ slug: args.collection as string })],
      },
    )();

    if (cacheHit) {
      ctx.debugLog({
        message: `Cache HIT, operation: find, collection: ${args.collection.toString()}`,
        payload,
      });
    } else {
      ctx.debugLog({
        message: `Cache SKIP, operation: find, collection: ${args.collection.toString()}, execution time - ${Date.now() - start} MS`,
        payload,
      });
    }

    if (!ctx.useSimpleCacheStrategy) {
      let depth = args.depth ?? payload.config.defaultDepth;

      if (depth > payload.config.maxDepth) {
        depth = payload.config.maxDepth;
      }

      if (depth > 0) {
        const populatedDocsMap = args.populatedDocsMap ?? new Map<string, Record<string, any>>();

        for (const doc of result.docs) {
          const docKey = `${args.collection.toString()}-${doc.id}`;

          if (!populatedDocsMap.has(docKey)) populatedDocsMap.set(docKey, { ...doc });
        }

        await populateDocRelationships({
          context: args.context,
          ctx,
          depth,
          docs: result.docs.map((doc) => ({
            data: doc,
            fields: payload.collections[args.collection].config.fields,
          })),
          draft: args.draft,
          fallbackLocale: args.fallbackLocale ?? undefined,
          find,
          locale: args.locale || undefined,
          payload,
          populatedDocsMap,
          showHiddenFields: args.showHiddenFields,
        });
      }
    }

    return result;
  };
};
