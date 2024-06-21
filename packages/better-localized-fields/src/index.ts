import type { Plugin } from 'payload';

import { attachLocalesProvider } from './attachLocalesProvider';
// import { attachLocalizedFieldToEditor } from './attachLocalizedFieldToEditor';
import { traverseFields } from './traverseFields';
import type { BetterLocalizedFieldsOptions as BetterLocalizedFieldsOptions } from './types';

export const betterLocalizedFields =
  (options: BetterLocalizedFieldsOptions = {}): Plugin =>
  (config) => {
    if (options.disabled) return config;

    config.collections?.forEach((collection) => {
      traverseFields({ fields: collection.fields, options });
      attachLocalesProvider(collection);
    });

    config.globals?.forEach((global) => {
      traverseFields({ fields: global.fields, options });
      attachLocalesProvider(global);
    });

    return {
      ...config,
      // editor: async ({ config: sanitizedConfig }) => {
      //   const editor = await config.editor({ config: sanitizedConfig });

      //   attachLocalizedFieldToEditor({ editor, options });

      //   return editor;
      // },
    };
  };
