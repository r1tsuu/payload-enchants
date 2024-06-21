import type { PayloadRequest } from 'payload';

export type TranslateResolverArgs = {
  /** Locale to translate from */
  localeFrom: string;
  /** Locale to translate to */
  localeTo: string;
  req: PayloadRequest;
  texts: string[];
};

export type TranslateResolverResponse =
  | {
      success: false;
    }
  | {
      success: true;
      translatedTexts: string[];
    };

export type TranslateResolver = {
  key: string;
  resolve: (
    args: TranslateResolverArgs,
  ) => Promise<TranslateResolverResponse> | TranslateResolverResponse;
};
