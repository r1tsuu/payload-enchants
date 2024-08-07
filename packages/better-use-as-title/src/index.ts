import type { PayloadRequest, Plugin, TextField, TypedCollection } from 'payload';
import { deepMerge } from 'payload/shared';

import { InjectCustomUseAsTitle } from './index.client';

export type BetterUseAsTitleArgs<T extends keyof TypedCollection> = {
  collections: {
    fieldOverride?: Partial<TextField>;
    slug: T;
    useAsTitle: (args: {
      data: TypedCollection[T];
      req: PayloadRequest;
    }) => Promise<string> | string;
  }[];
  fieldOverride?: Partial<TextField>;
};

export const betterUseAsTitle =
  <T extends keyof TypedCollection>(args: BetterUseAsTitleArgs<T>): Plugin =>
  (config) => {
    if (!config.collections) return config;

    config.collections.forEach((collection) => {
      const pluginCollectionConfig = args.collections.find((each) => each.slug === collection.slug);

      if (!pluginCollectionConfig) return;

      const { fieldOverride, useAsTitle } = pluginCollectionConfig;

      const overrideField = {
        ...(args.fieldOverride ?? {}),
        ...(fieldOverride ?? {}),
      };

      const useAsTitleField: TextField = {
        admin: {
          hidden: true,
        },
        hooks: {
          beforeValidate: [
            ({ data: dataToUpdate, originalDoc, req }) => {
              const data = deepMerge(originalDoc ?? {}, dataToUpdate);

              return useAsTitle({ data, req });
            },
          ],
        },
        label: 'Admin Title',
        name: 'useAsTitle',
        type: 'text',
        ...(overrideField as TextField),
      };

      collection.fields.push(useAsTitleField);
      collection.fields.push({
        admin: {
          components: {
            Field: InjectCustomUseAsTitle,
          },
        },
        name: 'injectCustomUseAsTitle',
        type: 'ui',
      });
      collection.admin = collection.admin ?? {};

      collection.endpoints = collection.endpoints || [];

      collection.endpoints.push({
        handler: async (req) => {
          const data = await req.json();

          const adminTitle = await useAsTitle({ data, req });

          return Response.json({ useAsTitle: adminTitle });
        },
        method: 'post',
        path: '/use-as-title',
      });

      collection.admin.useAsTitle = useAsTitleField.name;
    });

    return config;
  };
