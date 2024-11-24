// import { betterLocalizedFields } from '@payload-enchants/better-localized-fields';
import { copyResolver, translator } from '@payload-enchants/translator';
import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { slateEditor } from '@payloadcms/richtext-slate';
import path from 'path';
import { buildConfig } from 'payload';
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
          custom: {
            translatorSkip: true,
          },
          localized: true,
          name: 'skip',
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
          blocks: [
            {
              fields: [
                {
                  fields: [
                    {
                      fields: [
                        {
                          localized: true,
                          name: 'text',
                          type: 'text',
                        },
                      ],
                      name: 'group',
                      type: 'group',
                    },
                  ],
                  name: 'arr',
                  type: 'array',
                },
              ],
              slug: 'test',
            },
          ],
          name: 'deep',
          type: 'blocks',
        },
        {
          localized: true,
          name: 'someRich',
          type: 'richText',
        },
        {
          name: 'up',
          relationTo: 'media',
          type: 'upload',
        },
        {
          name: 'slug',
          type: 'text',
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
    {
      fields: [],
      slug: 'media',
      upload: true,
    },
  ],
  db:
    process.env.USE_POSTGRES === 'true'
      ? postgresAdapter({
          pool: {
            connectionString: process.env.POSTGRES_URI!,
          },
        })
      : mongooseAdapter({
          url: process.env.MONGODB_URI || 'mongodb://localhost:27017/translator',
        }),
  editor: isLexical ? lexicalEditor({}) : slateEditor({}),
  endpoints: [
    {
      handler: async ({ payload }) => {
        const data = await payload.find({
          collection: 'posts',
          context: {
            select: ['up', 'array.titleLocalized', 'blocks.id'],
          },
        });

        return Response.json(data);
      },
      method: 'get',
      path: '/select',
    },
  ],
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
    // cachedPayloadPlugin,
    // seo({ collections: ['posts'], uploadsCollection: 'media' }),
    // docsReorder({
    //   collections: [
    //     {
    //       slug: 'posts',
    //     },
    //   ],
    // }),
    translator({
      collections: ['posts'],
      globals: [],
      resolvers: [copyResolver()],
    }),
    // fieldsSelect({ sanitizeExternals: true }),
    // betterLocalizedFields(),
    // betterUseAsTitle({
    //   collections: [
    //     {
    //       slug: 'better-use-as-title-test',
    //       useAsTitle: ({ data }) => `${data.firstName ?? ''} - ${data.secondName}, ${data.age} y.o`,
    //     },
    //   ],
    // }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
});
