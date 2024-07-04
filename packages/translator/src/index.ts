/* eslint-disable perfectionist/sort-named-exports */
import type { Plugin } from 'payload';
import { deepMerge } from 'payload/shared';

import { CustomButton } from './client/components/CustomButton';
import { translations } from './i18n-translations';
import { translateEndpoint } from './translate/endpoint';
import { translateOperation } from './translate/operation';
import type { TranslatorConfig } from './types';

export { translateOperation };

export const translator: (pluginConfig: TranslatorConfig) => Plugin = (pluginConfig) => {
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
              ...(collection.admin ?? {}),
              components: {
                ...(collection.admin?.components ?? {}),
                edit: {
                  ...(collection.admin?.components?.edit ?? {}),
                  PublishButton: CustomButton('publish'),
                  SaveButton: CustomButton('save'),
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
        ...(config.endpoints ?? []),
        {
          handler: translateEndpoint,
          method: 'post',
          path: '/translator/translate',
        },
      ],
      globals:
        config.globals?.map((global) => {
          if (!pluginConfig.globals.includes(global.slug)) return global;

          return {
            ...global,
            admin: {
              ...(global.admin ?? {}),
              components: {
                ...(global.admin?.components ?? {}),
                elements: {
                  ...(global.admin?.components?.elements ?? {}),
                  PublishButton: CustomButton('publish'),
                  SaveButton: CustomButton('save'),
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
