import type { Plugin } from 'payload/config';
import type { CollectionConfig, DateField, RelationshipField } from 'payload/types';

import { CustomSaveButton } from './components/CustomSaveButton';
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

    const scheduledToPublishDocParent: RelationshipField = {
      name: 'parent',
      relationTo: [],
      required: true,
      type: 'relationship',
    };

    const ScheduledToPublishDocuments: CollectionConfig = {
      fields: [
        scheduledToPublishDocParent,
        {
          name: 'scheduledAt',
          required: true,
          type: 'date',
        },
        {
          name: 'doc',
          required: true,
          type: 'json',
        },
        {
          name: 'isPublished',
          required: true,
          type: 'checkbox',
        },
      ],
      slug: 'scheduled-to-publish-documents',
    };

    const sanitizedOptions: SanitizedOptions = {
      ScheduledToPublishDocuments: ScheduledToPublishDocuments,
      collections,
      publishedAtField,
      scheduledAccess: overridableOptions.scheduledAccess ?? scheduledAccess,
      scheduledToPublishDocParent,
    };

    config.collections.forEach((collection) => {
      if (!collections.includes(collection.slug)) return;

      collection.fields = [...collection.fields, publishedAtField];
      collection.hooks = collection.hooks ?? {};
      collection.hooks.beforeOperation = collection.hooks.beforeOperation ?? [];
      collection.hooks.beforeOperation.push(beforeOperation(sanitizedOptions));

      collection.admin = collection.admin ?? {};
      collection.admin.components = collection.admin.components ?? {};
      collection.admin.components.edit = collection.admin.components.edit ?? {};

      const IncomingCustomSaveButton = collection.admin.components.edit.SaveButton;

      collection.admin.components.edit.SaveButton = () => {
        return (
          <CustomSaveButton
            incomingCustomSaveButton={
              IncomingCustomSaveButton ? <IncomingCustomSaveButton /> : null
            }
          />
        );
      };

      scheduledToPublishDocParent.relationTo.push(collection.slug);
    });

    if (scheduledToPublishDocParent.relationTo.length) {
      config.collections.push(ScheduledToPublishDocuments);
    }

    return config;
  };
