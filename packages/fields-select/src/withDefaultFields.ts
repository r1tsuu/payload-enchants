import type { CollectionConfig, Field } from 'payload';

export const withDefaultFields = (collection: CollectionConfig) => {
  let fields = [
    ...collection.fields,
    {
      name: 'id',
      type: 'text',
    },
  ] as Field[];

  if (collection.upload) {
    fields = [
      ...fields,
      ...([
        {
          name: 'filename',
          type: 'text',
        },
        {
          name: 'mimeType',
          type: 'text',
        },
        {
          name: 'filesize',
          type: 'number',
        },
        {
          name: 'url',
          type: 'string',
        },
        {
          name: 'thumbnailURL',
          type: 'string',
        },
      ] as Field[]),
    ];
  }

  if (collection.versions) {
    fields.push({ name: '_status', type: 'text' });
  }

  if (collection.auth) {
    if (typeof collection.auth === 'object' && collection.auth.disableLocalStrategy) return fields;
    fields = [
      ...fields,
      {
        name: 'email',
        type: 'email',
      },
    ];
  }

  return fields;
};
