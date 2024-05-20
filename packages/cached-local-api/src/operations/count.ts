import type { Payload } from 'payload';

import type { Count, CountArgs, SanitizedArgsContext } from '../types';

export const buildCount = ({
  ctx,
  payload,
}: {
  ctx: SanitizedArgsContext;
  payload: Payload;
}): Count => {
  return async function count(args: CountArgs) {
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

    const result = await ctx.unstable_cache(
      () => {
        return payload.count({ ...args, depth: 0 });
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.buildTagFind({ slug: args.collection as string })],
      },
    )();

    return result;
  };
};
