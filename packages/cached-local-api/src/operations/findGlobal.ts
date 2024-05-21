import type { Payload } from 'payload';

import { populate } from '../populate';
import type { FindByID, FindGlobal, FindGlobalArgs, SanitizedArgsContext } from '../types';

export const buildFindGlobal = ({
  ctx,
  findByID,
  payload,
}: {
  ctx: SanitizedArgsContext;
  findByID: FindByID;
  payload: Payload;
}): FindGlobal => {
  return async function findGlobal(args: FindGlobalArgs) {
    const shouldCache = await ctx.shouldCacheFindGlobalOperation(args);

    if (!shouldCache) return payload.findGlobal(args);

    const locale = args.locale ?? args.req?.locale;

    const fallbackLocale = args.fallbackLocale ?? args.req?.fallbackLocale;

    const user = args.req?.user ?? args.user;

    const keys = [
      args.slug,
      args.draft,
      fallbackLocale,
      locale,
      args.overrideAccess,
      user,
      args.showHiddenFields,
      args.context,
      args.req?.transactionID,
    ];

    let cacheHit = true;

    const start = Date.now();

    const doc = await ctx.unstable_cache(
      () => {
        cacheHit = false;

        return payload.findGlobal({ ...args, depth: 0 });
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.buildTagFindGlobal({ slug: args.slug as string })],
      },
    )();

    if (cacheHit) {
      ctx.debugLog({
        message: `Cache HIT, operation: findGlobal, global: ${args.slug.toString()}`,
        payload,
      });
    } else {
      ctx.debugLog({
        message: `Cache skipped, operation: findGlobal, global: ${args.slug.toString()},execution time - ${Date.now() - start} MS`,
        payload,
      });
    }

    const depth = args.depth ?? payload.config.defaultDepth;

    const global = payload.config.globals.find((each) => each.slug === args.slug)!;

    if (depth > 0)
      await populate({
        context: args.context,
        data: doc,
        depth,
        draft: args.draft,
        fallbackLocale: args.fallbackLocale || undefined,
        fields: global.fields,
        findByID,
        locale: args.locale || undefined,
        payload,
        req: args.req,
        showHiddenFields: args.showHiddenFields,
      });

    return doc;
  };
};
