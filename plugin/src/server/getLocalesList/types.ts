import type { Locale } from 'payload/config';

export type GetLocalesListArgs = {
  collectionSlug?: string;
  currentLocaleCode: string;
  globalSlug?: string;
  id?: number | string;
};

export type LocalesList = {
  isEmpty: boolean;
  locale: Locale;
}[];
