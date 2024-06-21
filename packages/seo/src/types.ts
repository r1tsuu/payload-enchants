import type { DocumentInfoContext } from '@payloadcms/ui/providers/DocumentInfo';
import type { Field, TextareaField, TextField, UploadField } from 'payload';

export type GenerateTitle = <T = any>(
  args: { doc: T; locale?: string } & DocumentInfoContext,
) => Promise<string> | string;

export type GenerateDescription = <T = any>(
  args: {
    doc: T;
    locale?: string;
  } & DocumentInfoContext,
) => Promise<string> | string;

export type GenerateImage = <T = any>(
  args: { doc: T; locale?: string } & DocumentInfoContext,
) => Promise<string> | string;

export type GenerateURL = <T = any>(
  args: { doc: T; locale?: string } & DocumentInfoContext,
) => Promise<string> | string;

export type PluginConfig = {
  collections?: string[];
  fieldOverrides?: {
    description?: Partial<TextareaField>;
    image?: Partial<UploadField>;
    title?: Partial<TextField>;
  };
  fields?: Field[];
  generateDescription?: GenerateDescription;
  generateDescriptionAi?: GenerateDescription;
  generateImage?: GenerateImage;
  generateTitle?: GenerateTitle;
  generateTitleAi?: GenerateTitle;
  generateURL?: GenerateURL;
  globals?: string[];
  interfaceName?: string;
  openaiApiKey?: string;
  tabbedUI?: boolean;
  uploadsCollection?: string;
};

export type Meta = {
  description?: string;
  image?: any; // TODO: type this
  keywords?: string;
  title?: string;
};
