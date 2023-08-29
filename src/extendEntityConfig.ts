import { Field } from 'payload/dist/fields/config/types';
import { TranslatorConfig } from './types';
import { Translator } from './translator/Translator';

const isWithTranslator = (slug: string, translatorEntityConfig?: string[]) => {
  if (!translatorEntityConfig) return false;
  return translatorEntityConfig.includes(slug);
};

export const extendEntityConfig = <Entity extends { slug: string; fields: Field[] }>(
  translatorConfig: TranslatorConfig,
  entityConfig?: Entity[],
  translatorEntityConfig?: string[]
) => {
  return entityConfig?.map((collection) => ({
    ...collection,
    fields: [
      ...(isWithTranslator(collection.slug, translatorEntityConfig)
        ? [
            {
              name: 'translator',
              type: 'ui',
              admin: {
                position: 'sidebar',
                components: {
                  Field: Translator(translatorConfig),
                },
              },
            } as Field,
          ]
        : []),
      ...collection.fields,
    ],
  }));
};
