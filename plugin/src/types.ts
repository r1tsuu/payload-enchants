import type { GeneratedTypes } from 'payload';

import type { TranslateResolver } from './resolvers/types';

export type PluginConfig = {
  collections: (keyof GeneratedTypes['collections'])[];
  disabled?: boolean;
  globals: (keyof GeneratedTypes['globals'])[];
  resolvers: TranslateResolver[];
};
