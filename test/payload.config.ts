import { betterLocalizedFields } from '@payload-enchants/better-localized-fields';
import { betterUseAsTitle } from '@payload-enchants/better-use-as-title';
import { docsReorder } from '@payload-enchants/docs-reorder';
import { translator } from '@payload-enchants/translator';
import { copyResolver } from '@payload-enchants/translator/resolvers/copy';
import { googleResolver } from '@payload-enchants/translator/resolvers/google';
import { openAIResolver } from '@payload-enchants/translator/resolvers/openAI';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import { buildConfig } from 'payload/config';
import { en } from 'payload/i18n/en';
import { fileURLToPath } from 'url';

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
          name: 'firstName',
          type: 'text',
        },
        {
          name: 'secondName',
          type: 'text',
        },
        {
          name: 'age',
          type: 'number',
        },
      ],
      slug: 'better-use-as-title-test',
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
    const usersCount = await payload.count({
      collection: 'users',
    });

    if (!usersCount.totalDocs) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
        },
      });
    }

    // await seed({
    //   isLexical,
    //   payload,
    // });

    // await seedDocsReorderExamples(payload);
  },
  plugins: [
    docsReorder({
      collections: [
        {
          slug: 'docs-reoder-examples',
        },
      ],
    }),
    // translator({
    //   collections: ['posts', 'small-posts'],
    //   globals: [],
    //   resolvers: [
    //     copyResolver(),
    //     googleResolver({
    //       apiKey: process.env.GOOGLE_API_KEY!,
    //     }),
    //     openAIResolver({
    //       apiKey: process.env.OPENAI_KEY!,
    //     }),
    //   ],
    // }),
    betterLocalizedFields(),
    betterUseAsTitle({
      collections: [
        {
          slug: 'better-use-as-title-test',
          useAsTitle: ({ data }) => `${data.firstName ?? ''} - ${data.secondName}, ${data.age} y.o`,
        },
      ],
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
