import type { Plugin } from 'payload/config';
import { deepMerge } from 'payload/utilities';

import { CustomSaveButton } from './client/components/CustomSaveButton';
import { translateEndpoint } from './translate/endpoint';
import { translations } from './translations';
import type { PluginConfig } from './types';

export const payloadPluginTranslator: (pluginConfig: PluginConfig) => Plugin = (pluginConfig) => {
  return (config) => {
    if (pluginConfig.disabled || !config.localization || config.localization.locales.length < 2)
      return config;

    return {
      ...config,
      admin: {
        ...(config.admin ?? {}),
        custom: {
          ...(config.admin?.custom ?? {}),
          translator: {
            resolvers: pluginConfig.resolvers.map(({ key }) => ({ key })),
          },
        },
      },
      collections:
        config.collections?.map((collection) => {
          if (!pluginConfig.collections.includes(collection.slug)) return collection;

          return {
            ...collection,
            admin: {
              components: {
                edit: {
                  SaveButton: CustomSaveButton,
                },
              },
            },
          };
        }) ?? [],
      custom: {
        ...(config.custom ?? {}),
        translator: {
          resolvers: pluginConfig.resolvers,
        },
      },
      endpoints: [
        ...(config.endpoints ?? [
          {
            handler: translateEndpoint,
            method: 'post',
            path: '/translator/translate',
          },
        ]),
      ],
      globals:
        config.globals?.map((global) => {
          if (!pluginConfig.globals.includes(global.slug)) return global;

          return {
            ...global,
            admin: {
              components: {
                elements: {
                  SaveButton: CustomSaveButton,
                },
              },
            },
          };
        }) ?? [],
      i18n: {
        ...config.i18n,
        translations: {
          ...deepMerge(config.i18n?.translations ?? {}, translations),
        },
      },
    };
  };
};
