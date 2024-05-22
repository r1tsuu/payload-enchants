import type { GeneratedTypes, Payload } from 'payload';

import type { Count, CountArgs, SanitizedArgsContext } from '../types';

export const buildCount = ({
  ctx,
  payload,
}: {
  ctx: SanitizedArgsContext;
  payload: Payload;
}): Count => {
  return async function count<T extends keyof GeneratedTypes['collections']>(args: CountArgs<T>) {
    const shouldCache = await ctx.shouldCacheCountOperation(args);

    if (!shouldCache) return payload.count(args);

    const locale = args.locale ?? args.req?.locale;

    const user = args.req?.user ?? args.user;

    let userKey = user;

    if (user && 'collection' in user && 'id' in user) {
      userKey = [user.collection, user.id];
    }

    const keys = [
      'count',
      args.collection,
      locale,
      args.where,
      args.overrideAccess,
      userKey,
      args.context,
      args.req?.transactionID,
    ];

    let cacheHit = true;

    const start = Date.now();

    const result = await ctx.unstable_cache(
      () => {
        cacheHit = false;

        return payload.count({ ...args, depth: 0 });
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.buildTagFind({ slug: args.collection as string })],
      },
    )();

    if (cacheHit) {
      ctx.debugLog({
        message: `Cache HIT, operation: count, collection: ${args.collection.toString()}`,
        payload,
      });
    } else {
      ctx.debugLog({
        message: `Cache skipped, operation: cound, collection: ${args.collection.toString()}, execution time - ${Date.now() - start} MS`,
        payload,
      });
    }

    return result;
  };
};
