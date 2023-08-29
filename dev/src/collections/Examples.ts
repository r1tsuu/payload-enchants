import { CollectionConfig } from 'payload/types';

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const Examples: CollectionConfig = {
  slug: 'examples',
  admin: {
    useAsTitle: 'someField',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      localized: true,
    },
    {
      name: 'textarea',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'richtext',
      type: 'richText',
      localized: true,
    },
    {
      name: 'array',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'blocks',
      type: 'blocks',
      blocks: [
        {
          slug: 'block',
          fields: [
            {
              name: 'text',
              type: 'text',
              localized: true,
            },
          ],
        },
      ],
    },
  ],
};

export default Examples;
