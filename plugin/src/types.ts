import type { TranslateResolver } from './resolvers/types';

export type PluginConfig = {
  collections: string[];
  disabled?: boolean;
  resolver: TranslateResolver;
};

export type GetLocalesListHandlerArgs = {
  /** active locale */
  locale: string;
} & (
  | {
      collectionSlug: string;
      id: number | string;
    }
  | {
      globalSlug: string;
    }
);

export type TranslateHandlerArgs = {
  data: Record<string, any>;
  emptyOnly: boolean;
  /** active locale */
  locale: string;
  localeFrom: string;
} & (
  | {
      collectionSlug: string;
      id: number | string;
    }
  | {
      globalSlug: string;
    }
);

export type TranslateHandlerResponse = {
  translatedData: Record<string, any>;
};
