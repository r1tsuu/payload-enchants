import { addDataAndFileToRequest } from '@payloadcms/next/utilities';
import { withMergedProps } from '@payloadcms/ui/elements/withMergedProps';
import type { Config } from 'payload/config';
import type { Field, GroupField, TabsField, TextField } from 'payload/types';
import { deepMerge } from 'payload/utilities';

import { MetaDescription } from './fields/MetaDescription';
import { MetaImage } from './fields/MetaImage';
import { MetaTitle } from './fields/MetaTitle';
import { openaiMessage } from './openai/message';
import { translations } from './translations/index';
import type {
  GenerateDescription,
  GenerateImage,
  GenerateTitle,
  GenerateURL,
  PluginConfig,
} from './types';
import { Overview } from './ui/Overview';
import { Preview } from './ui/Preview';

const seo =
  (pluginConfig: PluginConfig) =>
  (config: Config): Config => {
    const seoFields: GroupField[] = [
      {
        fields: [
          {
            admin: {
              components: {
                Field: Overview,
              },
            },
            label: 'Overview',
            name: 'overview',
            type: 'ui',
          },
          {
            admin: {
              components: {
                Field: withMergedProps({
                  Component: MetaTitle,
                  sanitizeServerOnlyProps: true,
                  toMergeIntoProps: {
                    hasGenerateTitleAi:
                      typeof pluginConfig.generateTitleAi === 'function' &&
                      pluginConfig.openaiApiKey,
                    hasGenerateTitleFn: typeof pluginConfig?.generateTitle === 'function',
                  },
                }),
              },
            },
            localized: true,
            name: 'title',
            type: 'text',
            ...((pluginConfig?.fieldOverrides?.title as unknown as TextField) ?? {}),
          },
          {
            admin: {
              components: {
                Field: withMergedProps({
                  Component: MetaDescription,
                  sanitizeServerOnlyProps: true,
                  toMergeIntoProps: {
                    hasGenerateDescriptionAi:
                      typeof pluginConfig.generateDescriptionAi === 'function' &&
                      pluginConfig.openaiApiKey,
                    hasGenerateDescriptionFn:
                      typeof pluginConfig?.generateDescription === 'function',
                  },
                }),
              },
            },
            localized: true,
            name: 'description',
            type: 'textarea',
            ...(pluginConfig?.fieldOverrides?.description ?? {}),
          },
          ...(pluginConfig?.uploadsCollection
            ? [
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                {
                  admin: {
                    components: {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      Field: withMergedProps({
                        Component: MetaImage,
                        sanitizeServerOnlyProps: true,
                        toMergeIntoProps: {
                          hasGenerateImageFn: typeof pluginConfig?.generateImage === 'function',
                        },
                      }),
                    },
                    description:
                      'Maximum upload file size: 12MB. Recommended file size for images is <500KB.',
                  },
                  label: 'Meta Image',
                  localized: true,
                  name: 'image',
                  relationTo: pluginConfig?.uploadsCollection,
                  type: 'upload',
                  ...(pluginConfig?.fieldOverrides?.image ?? {}),
                } as Field,
              ]
            : []),
          ...(pluginConfig?.fields || []),
          {
            admin: {
              components: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Field: withMergedProps({
                  Component: Preview,
                  sanitizeServerOnlyProps: true,
                  toMergeIntoProps: {
                    hasGenerateURLFn: typeof pluginConfig?.generateURL === 'function',
                  },
                }),
              },
            },
            label: 'Preview',
            name: 'preview',
            type: 'ui',
          },
        ],
        interfaceName: pluginConfig.interfaceName,
        label: 'SEO',
        name: 'meta',
        type: 'group',
      },
    ];

    return {
      ...config,
      collections:
        config.collections?.map((collection) => {
          const { slug } = collection;

          const isEnabled = pluginConfig?.collections?.includes(slug);

          if (isEnabled) {
            if (pluginConfig?.tabbedUI) {
              // prevent issues with auth enabled collections having an email field that shouldn't be moved to the SEO tab
              const emailField =
                (collection.auth ||
                  !(typeof collection.auth === 'object' && collection.auth.disableLocalStrategy)) &&
                collection.fields?.find((field) => 'name' in field && field.name === 'email');

              const hasOnlyEmailField = collection.fields?.length === 1 && emailField;

              const seoTabs: TabsField[] = hasOnlyEmailField
                ? [
                    {
                      tabs: [
                        {
                          fields: seoFields,
                          label: 'SEO',
                        },
                      ],
                      type: 'tabs',
                    },
                  ]
                : [
                    {
                      tabs: [
                        // append a new tab onto the end of the tabs array, if there is one at the first index
                        // if needed, create a new `Content` tab in the first index for this collection's base fields
                        ...(collection?.fields?.[0]?.type === 'tabs' &&
                        collection?.fields?.[0]?.tabs
                          ? collection.fields[0].tabs
                          : [
                              {
                                fields: [
                                  ...(emailField
                                    ? collection.fields.filter(
                                        (field) => 'name' in field && field.name !== 'email',
                                      )
                                    : collection.fields),
                                ],
                                label: collection?.labels?.singular || 'Content',
                              },
                            ]),
                        {
                          fields: seoFields,
                          label: 'SEO',
                        },
                      ],
                      type: 'tabs',
                    },
                  ];

              return {
                ...collection,
                fields: [
                  ...(emailField ? [emailField] : []),
                  ...seoTabs,
                  ...(collection?.fields?.[0]?.type === 'tabs' ? collection.fields.slice(1) : []),
                ],
              };
            }

            return {
              ...collection,
              fields: [...(collection?.fields || []), ...seoFields],
            };
          }

          return collection;
        }) || [],
      endpoints: [
        ...(config.endpoints ?? []),
        {
          handler: async (req) => {
            const reqWithData = await addDataAndFileToRequest({ request: req });

            const args: Parameters<GenerateTitle>[0] =
              reqWithData.data as unknown as Parameters<GenerateTitle>[0];

            const result = pluginConfig.generateTitle ? await pluginConfig.generateTitle(args) : '';

            return new Response(JSON.stringify({ result }), { status: 200 });
          },
          method: 'post',
          path: '/plugin-seo/generate-title',
        },
        {
          handler: async (req) => {
            if (!pluginConfig.openaiApiKey)
              return new Response(JSON.stringify({ message: 'Something went wrong' }), {
                status: 500,
              });

            const reqWithData = await addDataAndFileToRequest({ request: req });

            const args: Parameters<GenerateTitle>[0] =
              reqWithData.data as unknown as Parameters<GenerateTitle>[0];

            const content = pluginConfig.generateTitleAi
              ? await pluginConfig.generateTitleAi(args)
              : '';

            const aiResult = await openaiMessage({
              apiKey: pluginConfig.openaiApiKey,
              content,
              req,
            });

            return Response.json({ result: aiResult }, { status: 200 });
          },
          method: 'post',
          path: '/plugin-seo/generate-title-ai',
        },
        {
          handler: async (req) => {
            const reqWithData = await addDataAndFileToRequest({ request: req });

            const args: Parameters<GenerateDescription>[0] =
              reqWithData.data as unknown as Parameters<GenerateDescription>[0];

            const result = pluginConfig.generateDescription
              ? await pluginConfig.generateDescription(args)
              : '';

            return new Response(JSON.stringify({ result }), { status: 200 });
          },
          method: 'post',
          path: '/plugin-seo/generate-description',
        },
        {
          handler: async (req) => {
            if (!pluginConfig.openaiApiKey)
              return new Response(JSON.stringify({ message: 'Something went wrong' }), {
                status: 500,
              });

            const reqWithData = await addDataAndFileToRequest({ request: req });

            const args: Parameters<GenerateDescription>[0] =
              reqWithData.data as unknown as Parameters<GenerateDescription>[0];

            const content = pluginConfig.generateDescriptionAi
              ? await pluginConfig.generateDescriptionAi(args)
              : '';

            const aiResult = await openaiMessage({
              apiKey: pluginConfig.openaiApiKey,
              content,
              req,
            });

            return Response.json({ result: aiResult }, { status: 200 });
          },
          method: 'post',
          path: '/plugin-seo/generate-description-ai',
        },
        {
          handler: async (req) => {
            const reqWithData = await addDataAndFileToRequest({ request: req });

            const args: Parameters<GenerateURL>[0] =
              reqWithData.data as unknown as Parameters<GenerateURL>[0];

            const result = pluginConfig.generateURL ? await pluginConfig.generateURL(args) : '';

            return new Response(JSON.stringify({ result }), { status: 200 });
          },
          method: 'post',
          path: '/plugin-seo/generate-url',
        },
        {
          handler: async (req) => {
            const reqWithData = await addDataAndFileToRequest({ request: req });

            const args: Parameters<GenerateImage>[0] =
              reqWithData.data as unknown as Parameters<GenerateImage>[0];

            const result = pluginConfig.generateImage ? await pluginConfig.generateImage(args) : '';

            return new Response(JSON.stringify({ result }), { status: 200 });
          },
          method: 'post',
          path: '/plugin-seo/generate-image',
        },
      ],
      globals:
        config.globals?.map((global) => {
          const { slug } = global;

          const isEnabled = pluginConfig?.globals?.includes(slug);

          if (isEnabled) {
            if (pluginConfig?.tabbedUI) {
              const seoTabs: TabsField[] = [
                {
                  tabs: [
                    // append a new tab onto the end of the tabs array, if there is one at the first index
                    // if needed, create a new `Content` tab in the first index for this global's base fields
                    ...(global?.fields?.[0].type === 'tabs' && global?.fields?.[0].tabs
                      ? global.fields[0].tabs
                      : [
                          {
                            fields: [...(global?.fields || [])],
                            label: global?.label || 'Content',
                          },
                        ]),
                    {
                      fields: seoFields,
                      label: 'SEO',
                    },
                  ],
                  type: 'tabs',
                },
              ];

              return {
                ...global,
                fields: [
                  ...seoTabs,
                  ...(global?.fields?.[0].type === 'tabs' ? global.fields.slice(1) : []),
                ],
              };
            }

            return {
              ...global,
              fields: [...(global?.fields || []), ...seoFields],
            };
          }

          return global;
        }) || [],
      i18n: {
        ...config.i18n,
        translations: {
          ...deepMerge(translations, config.i18n?.translations),
        },
      },
    };
  };

export { seo };
