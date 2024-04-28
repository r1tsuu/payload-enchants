import type { PayloadHandler } from 'payload/config';

import { findEntity } from '../findEntity';

export type GetLocalesListArgs = {
  collectionSlug?: string;
  currentLocaleCode: string;
  globalSlug?: string;
  id?: number | string;
};

export const getLocalesList: PayloadHandler = async (req) => {
  const args = await req.json?.();

  const { config, doc } = await findEntity(args);
};
