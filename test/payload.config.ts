import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload/config';
import { en } from 'payload/i18n/en';
import { payloadPluginTranslator } from 'payload-plugin-translator';
import { copyResolver } from 'payload-plugin-translator/resolvers/copy';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);

const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
    },
  },

  collections: [
    {
      access: {
        delete: () => false,
        update: () => false,
      },
      admin: {
        preview: () => {
          console.log('here we are');

          return '';
        },
      },
      auth: true,
      fields: [],
      slug: 'users',
    },
    {
      fields: [
        {
          localized: true,
          name: 'rich',
          type: 'richText',
        },
      ],
      slug: 'tests',
    },
    {
      fields: [
        {
          localized: true,
          name: 'title',
          type: 'text',
        },
      ],
      slug: 'tests_b',
    },
    {
      fields: [
        {
          blocks: [
            {
              fields: [
                {
                  localized: true,
                  name: 'title',
                  type: 'text',
                },
              ],
              slug: 'some',
            },
          ],
          name: 'blocks',
          type: 'blocks',
        },
      ],
      slug: 'blocks_test',
    },
  ],
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  editor: lexicalEditor({}),
  i18n: {
    supportedLanguages: { en },
  },
  localization: {
    defaultLocale: 'en',
    fallback: false,
    locales: ['en', 'de', 'pl'],
  },
  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    });

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
        },
      });
    }
  },
  plugins: [
    payloadPluginTranslator({
      collections: ['tests', 'tests_b'],
      resolver: copyResolver(),
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
