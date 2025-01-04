import type { TextField } from 'payload';

type FieldFunctionProps = {
  /**
   * Tell the component if the generate AI function is available as configured in the plugin config
   */
  hasGenerateAi?: boolean;
  /**
   * Tell the component if the generate function is available as configured in the plugin config
   */
  hasGenerateFn?: boolean;
  overrides?: Partial<TextField>;
};

type FieldFunction = ({ hasGenerateAi, hasGenerateFn, overrides }: FieldFunctionProps) => TextField;

export const MetaTitleField: FieldFunction = ({
  hasGenerateAi = false,
  hasGenerateFn = false,
  overrides,
}) => {
  return {
    admin: {
      components: {
        Field: {
          clientProps: {
            hasGenerateTitleAi: hasGenerateAi,
            hasGenerateTitleFn: hasGenerateFn,
          },
          path: 'src/payload/plugins/seo/fields/MetaTitle/MetaTitleComponent#MetaTitleComponent',
        },
      },
    },
    localized: true,
    name: 'title',
    type: 'text',
    ...((overrides as unknown as TextField) ?? {}),
  };
};
