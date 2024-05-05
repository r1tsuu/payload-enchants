import type { Field } from 'payload/types';

import { LocalesDataProvider } from './providers/LocalesData/provider';

export const attachLocalesProvider = (entity: { fields: Field[] }) => {
  entity.fields = [
    {
      admin: {
        components: {
          Field: LocalesDataProvider,
        },
      },
      fields: entity.fields,
      type: 'row',
    },
  ];
};
