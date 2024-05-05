import type { Field } from 'payload/types';

import { LocalizedField } from './components/LocalizedField';
import type { BetterLocalizedFieldsOptions } from './types';

export const attachLocalizedField = ({
  field,
  options,
}: {
  field: Field;
  options: BetterLocalizedFieldsOptions;
}) => {
  field.admin = field.admin ?? {};

  const CustomFieldComponent = field.admin.components?.Field;

  if (field.type === 'richText') {
    field.admin = {
      ...field.admin,
      custom: {
        ...(field.admin?.custom ?? {}),
        localized: field.localized,
      },
    };
  }

  const LocaleTabButtonCustom = options.addons?.find(
    (each) => each.LocaleTabButton,
  )?.LocaleTabButton;

  field.admin.components = {
    ...(field.admin.components ?? {}),
    Field: (props) => (
      <LocalizedField
        {...props}
        {...(CustomFieldComponent && { customField: <CustomFieldComponent {...props} /> })}
        customTabButton={LocaleTabButtonCustom && <LocaleTabButtonCustom />}
        type={field.type}
      />
    ),
  };
};
