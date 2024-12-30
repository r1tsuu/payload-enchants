import type { UIField } from 'payload';

type FieldFunctionProps = {
  descriptionOverrides?: {
    maxLength?: number;
    minLength?: number;
  };
  /**
   * Path to the description field to use for the preview
   *
   * @default 'meta.description'
   */
  descriptionPath?: string;
  /**
   * Path to the image field to use for the preview
   *
   * @default 'meta.image'
   */
  imagePath?: string;
  overrides?: Partial<UIField>;
  titleOverrides?: {
    maxLength?: number;
    minLength?: number;
  };
  /**
   * Path to the title field to use for the preview
   *
   * @default 'meta.title'
   */
  titlePath?: string;
};

type FieldFunction = ({ overrides }: FieldFunctionProps) => UIField;

export const OverviewField: FieldFunction = ({
  descriptionOverrides,
  descriptionPath,
  imagePath,
  overrides,
  titleOverrides,
  titlePath,
}) => {
  return {
    admin: {
      components: {
        Field: {
          clientProps: {
            descriptionOverrides,
            descriptionPath,
            imagePath,
            titleOverrides,
            titlePath,
          },
          path: 'src/payload/plugins/seo/fields/Overview/OverviewComponent#OverviewComponent',
        },
      },
    },
    label: 'Overview',
    name: 'overview',
    type: 'ui',
    ...((overrides as unknown as UIField) ?? {}),
  };
};
