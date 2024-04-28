import { APIError } from 'payload/errors';
import type {
  PayloadRequest,
  SanitizedCollectionConfig,
  SanitizedGlobalConfig,
  TypeWithID,
} from 'payload/types';

type Args = {
  collectionSlug?: string;
  globalSlug?: string;
  id?: number | string;
  locale: string;
  req: PayloadRequest;
};

const findConfigBySlug = (
  slug: string,
  enities: SanitizedCollectionConfig[] | SanitizedGlobalConfig[],
) => enities.find((entity) => entity.slug === slug);

export const findEntity = async (
  args: Args,
): Promise<{
  config: SanitizedCollectionConfig | SanitizedGlobalConfig;
  doc: TypeWithID & Record<string, unknown>;
}> => {
  const { collectionSlug, globalSlug, id, locale, req } = args;

  if (!collectionSlug || !globalSlug) throw new APIError('Bad Request', 400);

  const { payload } = req;

  const { config } = payload;

  const isGlobal = !!globalSlug;

  if (!isGlobal && !id) throw new APIError('Bad Request', 400);

  const entityConfig = isGlobal
    ? findConfigBySlug(globalSlug, config.globals)
    : findConfigBySlug(collectionSlug, config.collections);

  if (!entityConfig) throw new APIError('Bad Request', 400);

  const docPromise = isGlobal
    ? payload.findGlobal({
        depth: 0,
        locale,
        overrideAccess: false,
        req,
        slug: args.globalSlug as string,
      })
    : payload.findByID({
        collection: collectionSlug as string,
        depth: 0,
        id: id as number | string,
        locale,
        overrideAccess: false,
        req,
      });

  return {
    config: entityConfig,
    doc: await docPromise,
  };
};
