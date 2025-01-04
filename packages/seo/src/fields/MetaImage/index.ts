import type { CollectionSlug, UploadField } from 'payload';

type FieldFunctionProps = {
  /**
   * Tell the component if the generate function is available as configured in the plugin config
   */
  hasGenerateFn?: boolean;
  overrides?: Partial<UploadField>;
  relationTo: string;
};

type FieldFunction = ({ hasGenerateFn, overrides }: FieldFunctionProps) => UploadField;

export const MetaImageField: FieldFunction = ({ hasGenerateFn = false, overrides, relationTo }) => {
  return {
    admin: {
      components: {
        Field: {
          clientProps: {
            hasGenerateImageFn: hasGenerateFn,
          },
          path: 'src/payload/plugins/seo/fields/MetaImage/MetaImageComponent#MetaImageComponent',
        },
      },
      description: 'Maximum upload file size: 12MB. Recommended file size for images is <500KB.',
    },
    label: 'Meta Image',
    localized: true,
    name: 'image',
    relationTo: relationTo as CollectionSlug,
    type: 'upload',
    ...((overrides as unknown as UploadField) ?? {}),
  };
};
