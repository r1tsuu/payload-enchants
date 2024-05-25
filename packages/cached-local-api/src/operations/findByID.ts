import type { GeneratedTypes, Payload } from 'payload';
import { APIError } from 'payload/errors';

import { populateDocRelationships } from '../populate';
import type { FindByID, FindByIDArgs, SanitizedArgsContext } from '../types';

export const buildFindByID = ({
  ctx,
  payload,
}: {
  ctx: SanitizedArgsContext;
  payload: Payload;
}): FindByID => {
  return async function findByID<T extends keyof GeneratedTypes['collections']>(
    args: FindByIDArgs<T>,
  ) {
    const hasInConfig = ctx.collections.some(({ slug }) => slug === args.collection);

    const shouldCache = hasInConfig && (await ctx.shouldCacheFindByIDOperation(args));

    if (!shouldCache) return payload.findByID(args);

    const locale = args.locale ?? args.req?.locale;

    const fallbackLocale = args.fallbackLocale ?? args.req?.fallbackLocale;

    const user = args.req?.user ?? args.user;

    const keys = [
      args.collection,
      args.draft,
      fallbackLocale,
      locale,
      args.id,
      args.overrideAccess,
      user,
      args.showHiddenFields,
      args.context,
      args.disableErrors,
    ];

    let cacheHit = true;

    const start = Date.now();

    const doc = await ctx.unstable_cache(
      () => {
        cacheHit = false;

        return payload.findByID({ ...args, depth: 0 });
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.buildTagFindByID({ id: args.id, slug: args.collection as string })],
      },
    )();

    if (cacheHit) {
      ctx.debugLog({
        message: `Cache HIT, operation: findByID, collection: ${args.collection.toString()}, id: ${args.id}`,
        payload,
      });
    } else {
      ctx.debugLog({
        message: `Cache SKIP, operation: findByID, collection: ${args.collection.toString()}, id: ${args.id}, execution time - ${Date.now() - start} MS`,
        payload,
      });
    }

    const depth = args.depth ?? payload.config.defaultDepth;

    if (depth > payload.config.maxDepth)
      throw new APIError(`maxDepth ${depth} - ${payload.config.maxDepth}`);

    payload.logger.info(args.populate);

    await populateDocRelationships({
      context: args.context,
      data: doc,
      depth,
      draft: args.draft,
      fallbackLocale: args.fallbackLocale || undefined,
      fields: payload.collections[args.collection].config.fields,
      findByID,
      locale: args.locale || undefined,
      payload,
      populate: args.populate,
      req: args.req,
      select: args.select,
      showHiddenFields: args.showHiddenFields,
    });

    return doc;
  };
};
