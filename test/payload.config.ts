import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { payloadPluginTranslator } from '@plugin/main';
import { getGoogleResolver } from '@plugin/resolvers/google';
import path from 'path';
import { buildConfig } from 'payload/config';
import { en } from 'payload/i18n/en';
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
      collections: ['tests'],
      resolver: getGoogleResolver({
        apiKey: '',
      }),
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
