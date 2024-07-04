import type { Field } from 'payload';
import { isReactClientComponent } from 'payload/shared';

import { LocalizedField } from './components/LocalizedField';
import type { BetterLocalizedFieldsOptions } from './types';
import { getClientProps } from './utils/getClientProps';

export const attachLocalizedField = ({
  field,
  options,
}: {
  field: {
    type:
      | 'array'
      | 'blocks'
      | 'checkbox'
      | 'code'
      | 'date'
      | 'email'
      | 'group'
      | 'json'
      | 'number'
      | 'point'
      | 'radio'
      | 'relationship'
      | 'richText'
      | 'select'
      | 'text'
      | 'textarea';
  } & Field;
  options: BetterLocalizedFieldsOptions;
}) => {
  field.admin = field.admin ?? {};

  const CustomFieldComponent = field.admin.components?.Field;

  if (field.type === 'richText') {
    field.admin = {
      ...field.admin,
    };
  }

  const LocaleTabButtonCustom = options.addons?.find(
    (each) => each.LocaleTabButton,
  )?.LocaleTabButton;

  field.admin.components = {
    ...(field.admin.components ?? {}),
    Field: (props) => {
      const clientProps = getClientProps(props);

      const isClientCustomComponent = isReactClientComponent(CustomFieldComponent);

      return (
        <LocalizedField
          {...getClientProps(props)}
          {...(CustomFieldComponent && {
            customField: (
              <CustomFieldComponent {...(isClientCustomComponent ? clientProps : props)} />
            ),
          })}
          customTabButton={LocaleTabButtonCustom && <LocaleTabButtonCustom />}
          type={field.type}
        />
      );
    },
  };
};
