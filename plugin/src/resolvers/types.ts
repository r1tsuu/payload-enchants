import type { PayloadRequest } from 'payload/types';

export type TranslateResolverArgs = {
  localeFrom: string;
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
