import type { CollectionSlug, GlobalSlug } from 'payload';

import type { TranslateResolver } from './resolvers/types';

export type TranslatorConfig = {
  /**
   * Collections with the enabled translator in the admin UI
   */
  collections: CollectionSlug[];
  /**
   * Disable the plugin
   */
  disabled?: boolean;
  /**
   * Globals with the enabled translator in the admin UI
   */
  globals: GlobalSlug[];
  /**
   * Add resolvers that you want to include, examples on how to write your own in ./plugin/src/resolvers
   */
  resolvers: TranslateResolver[];
};
