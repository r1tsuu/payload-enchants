import type { Payload } from 'payload';

import { populate } from '../populate';
import type { Find, FindArgs, FindByID, SanitizedArgsContext } from '../types';

export const buildFind = ({
  ctx,
  findByID,
  payload,
}: {
  ctx: SanitizedArgsContext;
  findByID: FindByID;
  payload: Payload;
}): Find => {
  return async function find(args: FindArgs) {
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
      args.showHiddenFields,
      args.context,
      args.req?.transactionID,
    ];

    const result = await ctx.unstable_cache(
      () => {
        return payload.find({ ...args, depth: 0 });
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.buildTagFind({ slug: args.collection as string })],
      },
    )();

    const depth = args.depth ?? payload.config.defaultDepth;

    if (depth > 0)
      for (const doc of result.docs) {
        await populate({
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
          req: args.req,
          showHiddenFields: args.showHiddenFields,
        });
      }

    return result;
  };
};
