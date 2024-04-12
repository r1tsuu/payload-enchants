import type { Plugin } from 'payload/config';

import { Translator } from './client/Translator';
import { getLocalesListHandler } from './server/getLocalesListHandler';
import { getTranslateHandler } from './server/translateHandler';
import type { PluginConfig } from './types';

export const payloadPluginTranslator: (pluginConfig: PluginConfig) => Plugin = (pluginConfig) => {
  return (config) => {
    if (pluginConfig.disabled || !config.localization || config.localization.locales.length < 2)
      return config;

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        if (!pluginConfig.collections.includes(collection.slug)) return collection;

        return {
          ...collection,
          admin: {
            components: {
              edit: {
                SaveButton: Translator,
              },
            },
          },
        };
      }),
      endpoints: [
        ...(config.endpoints ?? [
          {
            handler: getTranslateHandler(pluginConfig.resolver),
            method: 'post',
            path: '/translator/translate',
          },
          {
            handler: getLocalesListHandler,
            method: 'post',
            path: '/translator/locales-list',
          },
        ]),
      ],
    };
  };
};
