import { SlateToHtmlConfig } from '@slate-serializers/html';
import { HtmlToSlateConfig } from '@slate-serializers/html';
import { AuthCollection } from 'payload/dist/collections/config/types';
import { PayloadRequest } from 'payload/dist/types';

type BeforeTransalateData = {
  texts: string[];
  from: string;
  to: string;
  user: AuthCollection;
  req: PayloadRequest;
};

type AfterTranslateData = {
  translatedTexts: string[];
  user: AuthCollection;
  req: PayloadRequest;
};

type TranslateService = (text: string, target: string, source: string) => Promise<string>;

export type TranslatorConfig = {
  GOOGLE_API_KEY?: string;
  translateService?: TranslateService;
  afterTranslate?: (data: AfterTranslateData) => Promise<string[]>;
  beforeTranslate?: (data: BeforeTransalateData) => Promise<string[]>;
  access?: (req: PayloadRequest) => Promise<boolean> | boolean;
  slateToHtmlConfig?: SlateToHtmlConfig;
  htmlToSlateConfig?: HtmlToSlateConfig;
  collections?: string[];
  globals?: string[];
};
