import type { GeneratedTypes } from 'payload';
import type { Plugin } from 'payload/config';
import type { TextField } from 'payload/types';
import { deepMerge } from 'payload/utilities';

export type BetterUseAsTitleArgs<T extends keyof GeneratedTypes['collections']> = {
  collections: {
    fieldOverride?: Partial<TextField>;
    slug: T;
    useAsTitle: (data: T) => Promise<string> | string;
  }[];
  fieldOverride?: Partial<TextField>;
};

export const betterUseAsTitle =
  <T extends keyof GeneratedTypes['collections']>(args: BetterUseAsTitleArgs<T>): Plugin =>
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
            ({ data: dataToUpdate, originalDoc }) => {
              const data = deepMerge(originalDoc ?? {}, dataToUpdate);

              return useAsTitle(data);
            },
          ],
        },
        label: 'Admin Title',
        name: 'useAsTitle',
        type: 'text',
        ...(overrideField as TextField),
      };

      collection.fields.push(useAsTitleField);
      collection.admin = collection.admin ?? {};

      collection.admin.useAsTitle = useAsTitleField.name;
    });

    return config;
  };
