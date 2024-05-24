import type { GeneratedTypes, Payload } from 'payload';

import { populateDocRelationships } from '../populate';
import type { Find, FindArgs, FindByID, SanitizedArgsContext } from '../types';
import { chunkArray } from '../utils/chunkArray';

export const buildFind = ({
  ctx,
  findByID,
  payload,
}: {
  ctx: SanitizedArgsContext;
  findByID: FindByID;
  payload: Payload;
}): Find => {
  return async function find<T extends keyof GeneratedTypes['collections']>(args: FindArgs<T>) {
    const shouldCache = await ctx.shouldCacheFindOperation(args);

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
      args.pagination,
      args.overrideAccess,
      userKey,
      args.sort,
      args.showHiddenFields,
      args.context,
    ];

    let cacheHit = true;

    const start = Date.now();

    const result = await ctx.unstable_cache(
      () => {
        cacheHit = false;

        return payload.find({ ...args, depth: 0 });
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.buildTagFind({ slug: args.collection as string })],
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

    const depth = args.depth ?? payload.config.defaultDepth;

    if (depth > 0) {
      const batches = chunkArray(result.docs, 35);

      for (const batch of batches) {
        await Promise.all(
          batch.map((doc) =>
            populateDocRelationships({
              context: args.context,
              data: doc,
              depth,
              disableErrors: args.disableErrors,
              draft: args.draft,
              fallbackLocale: args.fallbackLocale ?? undefined,
              fields: payload.collections[args.collection].config.fields,
              findByID,
              locale: args.locale || undefined,
              payload,

              showHiddenFields: args.showHiddenFields,
            }),
          ),
        );
      }
    }

    return result;
  };
};
