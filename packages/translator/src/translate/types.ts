export type ValueToTranslate = {
  onTranslate: (translatedValue: any) => void;
  value: any;
};

export type TranslateArgs = {
  collectionSlug?: string;
  data?: Record<string, any>;
  emptyOnly?: boolean;
  globalSlug?: string;
  id?: number | string;
  /** active locale */
  locale: string;
  localeFrom: string;
  overrideAccess?: boolean;
  resolver: string;
  update?: boolean;
};

export type TranslateResult =
  | {
      success: false;
    }
  | {
      success: true;
      translatedData: Record<string, any>;
    };

export type TranslateEndpointArgs = Omit<TranslateArgs, 'update'>;
