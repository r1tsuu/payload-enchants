import type { Config, Plugin } from 'payload/config';
import path from 'path';

import type { TranslatorConfig } from './types';
import { createTranslatorHandler } from './translator/handler';
import { extendEntityConfig } from './extendEntityConfig';

export const translatorPlugin =
  (translatorConfig: TranslatorConfig) =>
  async (config: Config): Promise<Config> => {
    return {
      ...config,
      collections: extendEntityConfig(
        translatorConfig,
        config.collections,
        translatorConfig.collections
      ),
      globals: extendEntityConfig(translatorConfig, config.globals, translatorConfig.globals),
      endpoints: [
        ...(config.endpoints || []),
        {
          path: '/translator',
          method: 'post',
          handler: createTranslatorHandler(translatorConfig),
        },
      ],
    };
  };
