import type { PayloadRequest } from 'payload/types';

import type { SaveChangesArgs } from './handlers/types';

export type DocsReorderCollectionConfig = {
  slug: string;
};

export type DocsReorderOptions = {
  access?: (args: { data: SaveChangesArgs; req: PayloadRequest }) => Promise<boolean> | boolean;
  collections: DocsReorderCollectionConfig[];
  /**
   * Enable or disable the plugin
   * @default false
   */
  enabled?: boolean;
};
