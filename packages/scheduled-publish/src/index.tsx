import { DefaultSaveButton } from '@payloadcms/ui/elements/Save';
import type { Plugin } from 'payload/config';
import type { CollectionConfig, RelationshipField } from 'payload/types';

import { CustomSaveButton } from './components/CustomSaveButton';
import { beforeOperation } from './hooks/beforeOperation';
import { beforeRead } from './hooks/beforeRead';
import { scheduledAccess } from './scheduledAccess';
import type { SanitizedOptions, ScheduledPublishOptions } from './types';

export const scheduledPublish =
  ({ collections, disabled, ...overridableOptions }: ScheduledPublishOptions): Plugin =>
  (config) => {
    if (disabled || !config.collections) return config;

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
      scheduledAccess: overridableOptions.scheduledAccess ?? scheduledAccess,
    };

    config.collections.forEach((collection) => {
      if (!collections.includes(collection.slug)) return;

      collection.fields = [
        ...collection.fields,
        {
          admin: {
            hidden: true,
          },
          name: 'scheduledAt',
          type: 'date',
        },
      ];

      collection.hooks = collection.hooks ?? {};

      collection.hooks.beforeOperation = collection.hooks.beforeOperation ?? [];
      collection.hooks.beforeOperation.push(beforeOperation(sanitizedOptions));

      collection.hooks.beforeRead = collection.hooks.beforeRead ?? [];
      collection.hooks.beforeRead.push(beforeRead(sanitizedOptions));

      collection.admin = collection.admin ?? {};
      collection.admin.components = collection.admin.components ?? {};
      collection.admin.components.edit = collection.admin.components.edit ?? {};

      const IncomingCustomSaveButton = collection.admin.components.edit.SaveButton;

      collection.admin.components.edit.SaveButton = (props) => {
        return (
          <CustomSaveButton
            defaultSaveButton={<DefaultSaveButton />}
            incomingCustomSaveButton={
              IncomingCustomSaveButton ? <IncomingCustomSaveButton {...props} /> : null
            }
          />
        );
      };

      scheduledToPublishDocParent.relationTo.push(collection.slug);
    });

    if (scheduledToPublishDocParent.relationTo.length) {
      config.collections.push(ScheduledToPublishDocuments);

      // config.admin = config.admin ?? {};
      // config.admin.components = config.admin.components ?? {};
      // config.admin.components.providers = config.admin.components.providers ?? [];

      // config.admin.components.providers.push(({ children }) => {
      //   return (
      //     <>
      //       {children}
      //       <InjectFetchXPayloadAdminHeader />
      //     </>
      //   );
      // });
    }

    return config;
  };
