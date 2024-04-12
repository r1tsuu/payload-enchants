import type { PayloadRequest } from 'payload/types';

export type TranslateResolverArgs = {
  localeFrom: string;
  localeTo: string;
  req: PayloadRequest;
  skipAccess?: boolean;
  texts: string[];
};

export type TranslateResolverResponse = {
  translatedTexts: string[];
};

export type TranslateResolver = (args: TranslateResolverArgs) => Promise<TranslateResolverResponse>;

export type TranslatorResolverAccess = (args: TranslateResolverArgs) => Promise<boolean> | boolean;
