import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import { buildConfig } from 'payload/config';
import { en } from 'payload/i18n/en';
import { payloadPluginTranslator } from 'payload-plugin-translator';
import { copyResolver } from 'payload-plugin-translator/resolvers/copy';
import { googleResolver } from 'payload-plugin-translator/resolvers/google';
import { fileURLToPath } from 'url';

import { openAIResolver } from './../plugin/src/resolvers/openAI';
import { copyOtherLocales } from './copyOtherLocalesHook';
import { seed } from './seed';

const filename = fileURLToPath(import.meta.url);

const dirname = path.dirname(filename);

const isLexical = process.env.USE_LEXICAL === 'true' ? true : false;

export default buildConfig({
  admin: {
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
    },
  },

  collections: [
    {
      auth: true,
      fields: [],
      slug: 'users',
    },
    {
      fields: [
        {
          localized: true,
          name: 'title',
          type: 'text',
        },
        {
          localized: true,
          name: 'checkbox',
          type: 'checkbox',
        },
        {
          fields: [
            {
              localized: true,
              name: 'titleLocalized',
              type: 'text',
            },
          ],
          name: 'array',
          required: true,
          type: 'array',
        },
        {
          fields: [
            {
              localized: true,
              name: 'title',
              type: 'text',
            },
          ],
          localized: true,
          name: 'arrayLocalized',
          type: 'array',
        },
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
              slug: 'first',
            },
          ],
          name: 'blocks',
          type: 'blocks',
        },
        {
          localized: true,
          name: 'someRich',
          type: 'richText',
        },
      ],
      slug: 'posts',
    },
    {
      fields: [
        {
          localized: true,
          name: 'title',
          type: 'text',
        },
      ],
      hooks: {
        afterChange: [copyOtherLocales],
      },
      slug: 'small-posts',
    },
  ],
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  editor: isLexical ? lexicalEditor({}) : slateEditor({}),
  globals: [
    {
      fields: [],
      slug: 'test',
    },
  ],
  i18n: {
    supportedLanguages: { en },
  },
  localization: {
    defaultLocale: 'en',
    fallback: false,
    locales: [
      { code: 'en', label: 'English' },
      { code: 'de', label: 'German' },
      { code: 'pl', label: 'Polish' },
      { code: 'fr', label: 'French' },
    ],
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

    await seed({
      isLexical,
      payload,
    });
  },
  plugins: [
    payloadPluginTranslator({
      collections: ['posts', 'small-posts'],
      globals: [],
      resolvers: [
        copyResolver(),
        googleResolver({
          apiKey: process.env.GOOGLE_API_KEY!,
        }),
        openAIResolver({
          apiKey: process.env.OPENAI_KEY!,
        }),
      ],
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
