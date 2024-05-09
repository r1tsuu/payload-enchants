import type { Row } from '@payloadcms/ui/fields/Row';
import type { Field } from 'payload/types';

import { LocalesDataProvider } from './providers/LocalesData/provider';
import { getClientProps } from './utils/getClientProps';

export const attachLocalesProvider = (entity: { fields: Field[] }) => {
  const mainFields = entity.fields.filter((each) => each.admin?.position !== 'sidebar');

  const sidebarFields = entity.fields.filter((each) => each.admin?.position === 'sidebar');

  entity.fields = [
    {
      admin: {
        components: {
          Field: (props) => (
            <LocalesDataProvider {...(getClientProps(props) as React.ComponentProps<typeof Row>)} />
          ),
        },
      },
      fields: mainFields,
      type: 'row',
    },
  ];

  if (sidebarFields.length > 0) {
    sidebarFields.forEach((field) => {
      if (field.admin?.position) delete field.admin['position'];
    });

    entity.fields.push({
      admin: {
        components: {
          Field: (props) => <LocalesDataProvider {...props} />,
        },
        position: 'sidebar',
      },
      fields: sidebarFields,
      type: 'row',
    });
  }
};
