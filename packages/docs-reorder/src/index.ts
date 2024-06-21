import './styles.scss';

import type { Plugin } from 'payload';
import { deepMerge } from 'payload/shared';

import { defaultAccess } from './defaultAccess';
import { extendCollectionsConfig } from './extendCollectionsConfig';
import { saveChanges } from './handlers/saveChanges';
import { translations } from './translations';
import type { DocsReorderOptions } from './types';

export const docsReorder =
  (pluginOptions: DocsReorderOptions): Plugin =>
  (config) => {
    if (pluginOptions.enabled === false) {
      return config;
    }

    if (config.collections) {
      config.collections = extendCollectionsConfig(config.collections, pluginOptions);
    }

    config.endpoints = [
      ...(config.endpoints || []),
      {
        handler: saveChanges({ access: pluginOptions.access ?? defaultAccess }),
        method: 'post',
        path: '/collection-docs-order/save',
      },
    ];

    config.i18n = {
      ...config.i18n,
      translations: {
        ...deepMerge(translations, config.i18n?.translations),
      },
    };

    return config;
  };
