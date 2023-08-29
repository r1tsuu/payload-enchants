import { UIField } from 'payload/types';
import { Translator } from './translator/Translator';
import { TranslatorConfig } from './types';

export const translatorField = (translatorConfig: TranslatorConfig, field?: UIField): UIField => {
  return {
    name: 'translator',
    type: 'ui',
    admin: {
      components: {
        Field: Translator(translatorConfig),
      },
    },
  };
};
