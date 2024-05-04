import type { Field } from 'payload/types';

import { LocalizedField } from './components/LocalizedField';

export const attachLocalizedField = ({ field }: { field: Field }) => {
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

  field.admin.components = {
    ...(field.admin.components ?? {}),
    Field: (props) => (
      <LocalizedField
        {...props}
        {...(CustomFieldComponent && { customField: <CustomFieldComponent {...props} /> })}
        type={field.type}
      />
    ),
  };
};
