import type { GeneratedTypes, Payload } from 'payload';
import { ValidationError } from 'payload/errors';

import { populate } from '../populate';
import type { FindByID, FindOneArgs, SanitizedArgsContext } from '../types';

export const buildFindOne = ({
  ctx,
  findByID,
  payload,
}: {
  ctx: SanitizedArgsContext;
  findByID: FindByID;
  payload: Payload;
}) => {
  return async function findOne<T extends keyof GeneratedTypes['collections']>(
    args: FindOneArgs<T>,
  ): Promise<GeneratedTypes['collections'][T] | null> {
    const collectionInConfig = ctx.collections.find(({ slug }) => slug === args.collection);

    if (!collectionInConfig)
      throw new ValidationError([
        {
          field: 'args.collection',
          message: 'Invalid findOne collection ' + String(args.collection),
        },
      ]);

    const field = args.field
      ? collectionInConfig.findOneFields.find((each) => each.name === args.field)
      : collectionInConfig.findOneFields[0];

    if (!field)
      throw new ValidationError([
        { field: 'args.field', message: 'Invalid findOne field' + args.field },
      ]);

    const where = field.buildWhere(args.value);

    const shouldCache = await ctx.shouldCacheFindOperation(args);

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
      args.req?.transactionID,
    ];

    const doc = await ctx.unstable_cache(
      async () => {
        const {
          docs: [doc],
        } = await payload.find({ ...fullArgs, depth: 0 });

        if (!doc) return null;

        return doc;
      },
      [JSON.stringify(keys)],
      {
        tags: [ctx.buildTagFind({ slug: args.collection as string })],
      },
    )();

    const depth = args.depth ?? payload.config.defaultDepth;

    if (depth > 0 && doc)
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

    return doc;
  };
};
