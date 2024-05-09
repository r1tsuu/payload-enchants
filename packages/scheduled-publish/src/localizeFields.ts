import type { Field } from 'payload/types';

export const localizeFields = ({
  data,
  fields,
  locale,
  localizedData = {},
}: {
  data: Record<string, any>;
  fields: Field[];
  locale: string;
  localizedData?: Record<string, any>;
}) => {
  fields.forEach((field) => {
    if (field.type === 'tabs') {
      field.tabs.forEach((tab) => {
        if (tab.localized) {
          localizedData[locale] = localizeFields({
            data: data[tab.name],
            fields: tab.fields,
            locale,
          });
        }
      });
    }
  });

  return localizedData;
};
