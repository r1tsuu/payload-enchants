import type { TextareaField } from 'payload';

type FieldFunctionProps = {
  /**
   * Tell the component if the generate AI function is available as configured in the plugin config
   */
  hasGenerateAi?: boolean;
  /**
   * Tell the component if the generate function is available as configured in the plugin config
   */
  hasGenerateFn?: boolean;
  overrides?: Partial<TextareaField>;
};

type FieldFunction = ({
  hasGenerateAi,
  hasGenerateFn,
  overrides,
}: FieldFunctionProps) => TextareaField;

export const MetaDescriptionField: FieldFunction = ({
  hasGenerateAi = false,
  hasGenerateFn = false,
  overrides,
}) => {
  return {
    admin: {
      components: {
        Field: {
          clientProps: {
            hasGenerateDescriptionAi: hasGenerateAi,
            hasGenerateDescriptionFn: hasGenerateFn,
          },
          path: 'src/payload/plugins/seo/fields/MetaDescription/MetaDescriptionComponent#MetaDescriptionComponent',
        },
      },
    },
    localized: true,
    name: 'description',
    type: 'textarea',
    ...((overrides as unknown as TextareaField) ?? {}),
  };
};
