import type { UIField } from 'payload';

type FieldFunctionProps = {
  /**
   * Path to the description field to use for the preview
   *
   * @default 'meta.description'
   */
  descriptionPath?: string;
  /**
   * Tell the component if the generate function is available as configured in the plugin config
   */
  hasGenerateFn?: boolean;
  overrides?: Partial<UIField>;
  /**
   * Path to the title field to use for the preview
   *
   * @default 'meta.title'
   */
  titlePath?: string;
};

type FieldFunction = ({ hasGenerateFn, overrides }: FieldFunctionProps) => UIField;

export const PreviewField: FieldFunction = ({
  descriptionPath,
  hasGenerateFn = false,
  overrides,
  titlePath,
}) => {
  return {
    admin: {
      components: {
        Field: {
          clientProps: {
            descriptionPath,
            hasGenerateURLFn: hasGenerateFn,
            titlePath,
          },
          path: 'src/payload/plugins/seo/fields/Preview/PreviewComponent#PreviewComponent',
        },
      },
    },
    label: 'Preview',
    name: 'preview',
    type: 'ui',
    ...((overrides as unknown as UIField) ?? {}),
  };
};
