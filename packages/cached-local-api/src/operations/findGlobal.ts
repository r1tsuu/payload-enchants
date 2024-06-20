import type { GeneratedTypes, Payload } from 'payload';

import { populateDocRelationships } from '../populate';
import type { FindGlobal, FindGlobalArgs, SanitizedArgsContext } from '../types';

export const buildFindGlobal = ({
  ctx,
  find,
  payload,
}: {
  ctx: SanitizedArgsContext;
  find: Payload['find'];
  payload: Payload;
}): FindGlobal => {
  return async function findGlobal<T extends keyof GeneratedTypes['globals']>(
    args: FindGlobalArgs<T>,
  ) {
    const shouldCache = (await ctx.shouldCacheFindGlobalOperation(args)) && !ctx.disableCache;

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
    ];

    let cacheHit = true;

    const start = Date.now();

    const doc = await ctx.unstable_cache(
      () => {
        cacheHit = false;

        return payload.findGlobal({ ...args, depth: ctx.useSimpleCacheStrategy ? args.depth : 0 });
      },
      [JSON.stringify(keys)],
      {
        tags: [
          ctx.useSimpleCacheStrategy
            ? ctx.SIMPLE_CACHE_TAG
            : ctx.buildTagFindGlobal({ slug: args.slug as string }),
        ],
      },
    )();

    if (cacheHit) {
      ctx.debugLog({
        message: `Cache HIT, operation: findGlobal, global: ${args.slug.toString()}`,
        payload,
      });
    } else {
      ctx.debugLog({
        message: `Cache SKIP, operation: findGlobal, global: ${args.slug.toString()},execution time - ${Date.now() - start} MS`,
        payload,
      });
    }

    if (!ctx.useSimpleCacheStrategy) {
      let depth = args.depth ?? payload.config.defaultDepth;

      if (depth > payload.config.maxDepth) {
        depth = payload.config.maxDepth;
      }

      const global = payload.config.globals.find((each) => each.slug === args.slug)!;

      const populatedDocsMap = new Map<string, Record<string, any>>();

      if (depth > 0)
        await populateDocRelationships({
          context: args.context,
          ctx,
          depth,
          docs: [{ data: doc, fields: global.fields }],
          draft: args.draft,
          fallbackLocale: args.fallbackLocale || undefined,
          find,
          locale: args.locale || undefined,
          payload,
          populatedDocsMap,
          req: args.req,
          showHiddenFields: args.showHiddenFields,
        });
    }

    return doc;
  };
};
