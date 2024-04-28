import type { PayloadHandler } from 'payload/config';
import { APIError } from 'payload/errors';
import type { SanitizedCollectionConfig, SanitizedGlobalConfig } from 'payload/types';

import { findEntity } from './findEntity';

export type GetLocalesListArgs = {
  collectionSlug?: string;
  currentLocaleCode: string;
  globalSlug?: string;
  id?: number | string;
};

const findBySlug = (slug: string, enities: SanitizedCollectionConfig[] | SanitizedGlobalConfig[]) =>
  enities.find((entity) => entity.slug === slug);

export const getLocalesList: PayloadHandler = async (req) => {
  const args = await req.json?.();

  const { config, doc } = await findEntity(args);
};
