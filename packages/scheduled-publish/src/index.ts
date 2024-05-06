import type { Plugin } from 'payload/config';
import type { DateField } from 'payload/types';

import { beforeOperation } from './hooks/beforeOperation';
import { scheduledAccess } from './scheduledAccess';
import type { SanitizedOptions, ScheduledPublishOptions } from './types';

export const scheduledPublish =
  ({ collections, disabled, ...overridableOptions }: ScheduledPublishOptions): Plugin =>
  (config) => {
    if (disabled || !config.collections) return config;

    const publishedAtField: DateField = {
      admin: {
        hidden: true,
        ...(overridableOptions.publishedAtField?.admin ?? {}),
      },
      name: 'publishedAt',
      type: 'date',
      ...(overridableOptions.publishedAtField ?? {}),
    };

    const sanitizedOptions: SanitizedOptions = {
      collections,
      publishedAtField,
      scheduledAccess: overridableOptions.scheduledAccess ?? scheduledAccess,
    };

    config.collections.forEach((collection) => {
      if (!collections.includes(collection.slug)) return;

      collection.fields = [...collection.fields, publishedAtField];
      collection.hooks = collection.hooks ?? {};
      collection.hooks.beforeOperation = collection.hooks.beforeOperation ?? [];
      collection.hooks.beforeOperation.push(beforeOperation(sanitizedOptions));
    });

    return config;
  };
