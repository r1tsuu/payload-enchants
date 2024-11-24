# Translator plugin for Payload 3.0 (beta)

## Install

`pnpm add @payload-enchants/translator`

## Video

https://github.com/r1tsuu/payload-plugin-translator/assets/64744993/d39aeba4-bafc-4c3b-838e-9abc5cf1d64a

## Features:

1. A flexible structure with [resolvers](https://github.com/r1tsuu/payload-plugin-translator/tree/6d0c8098467f9b5e757bf9fd8cfe63ff5da68d5b/plugin/src/resolvers) that allows you to apply any kind of transformation to your localizated data.
2. Can be used not only from the admin panel, but within Local API as well. [Example of the hook](#example-of-the-hook-that-uses-local-operation-to-copy-the-doc-data-to-other-locales) that automatically fills the other locales data on create
3. Out of the box supports 3 resolvers - Copy, Google Translate, OpenAI and your own can be written easily.
4. Works with any nested document structure and 2 Rich Text editor adapters - Lexical and Slate.
5. You can omit some fields to translate. [Documentation](#omitting-fields)

## Usage:

```ts
import { buildConfig } from 'payload/config';
import {
  translator,
  copyResolver,
  googleResolver,
  openAIResolver,
  libreResolver,
} from '@payload-enchants/translator';

export default buildConfig({
  plugins: [
    translator({
      // collections with the enabled translator in the admin UI
      collections: ['posts', 'small-posts'],
      // globals with the enabled translator in the admin UI
      globals: [],
      // add resolvers that you want to include, examples on how to write your own in ./plugin/src/resolvers
      resolvers: [
        copyResolver(),
        googleResolver({
          apiKey: process.env.GOOGLE_API_KEY!,
        }),
        openAIResolver({
          apiKey: process.env.OPENAI_KEY!,
        }),
        libreResolver({
          apiKey: process.env.LIBRE_KEY!,
        }),
      ],
    }),
  ],
});
```

## Resolvers

### OpenAI

#### Config:

```ts
export type OpenAIResolverConfig = {
  apiKey: string; // API key
  chunkLength?: number; // How many texts to include into 1 request, default: 100
  model?: string; // model, default: 'gpt-3.5-turbo'
  promt?: OpenAIPrompt; // custom prompt
};
```

### Custom prompt:

```ts
export type OpenAIPrompt = (args: {
  localeFrom: string;
  localeTo: string;
  texts: string[];
}) => string;

// Default
const defaultPromt: OpenAIPrompt = ({ localeFrom, localeTo, texts }) => {
  return `Translate me the following array: ${JSON.stringify(texts)} in locale=${localeFrom} to locale ${localeTo}, respond me with the same array structure`;
};
```

### Google

#### Config:

```ts
export type GoogleResolverConfig = {
  apiKey: string; // API key
  chunkLength?: number; / /How many texts to include into 1 request, default: 100
};
```

### Writing your own

```ts
import type { TranslateResolver } from '@payload-enchants/translator/resolvers/types';

const myResolver: TranslateResolver = {
  key: 'my',
  resolve: async (args) => {
    const { localeFrom, localeTo, req, texts } = args;
    // here you can apply any kind of transformation to incoming texts, could be as well API call to a service.
    const transformed = texts.map((each) => `${each} translated to ${localeTo}`);

    return {
      success: true,
      translatedTexts: transformed,
    };
  },
};

export default buildConfig({
  plugins: [
    payloadPluginTranslator({
      collections: ['posts', 'small-posts'],
      globals: [],
      resolvers: [myResolver],
    }),
  ],
  // apply translations that will be used for your resolver in the admin UI
  i18n: {
    supportedLanguages: { en },
    translations: {
      en: {
        'plugin-translator': {
          resolver_my_buttonLabel: 'Google Translate',
          resolver_my_errorMessage: 'An error occurred when trying to translate the data',
          resolver_my_modalTitle: 'Choose the locale to translate from',
          resolver_my_submitButtonLabelEmpty: 'Translate only empty fields',
          resolver_my_submitButtonLabelFull: 'Translate all',
          resolver_my_successMessage: 'Successfully translated. Press "Save" to apply the changes.',
        },
      },
    },
  },
});
```

## Using the Local API

```ts
import { translateOperation } from '@payload-enchants/translator';

const translateResult = await translateOperation({
  collectionSlug: 'posts', // or globalSlug if globals,
  emptyOnly: false, // optional, should translate all the fields values or only fields that are empty, by default false.
  id: postDefaultLocale.id, // pass the doc id if it's a collection
  locale: 'de', // locale to translate to
  localeFrom: 'en', // locale to translate from
  payload, // payload instance, you can get it with getPayload or req.payload in hooks
  req, // PayloadRequest, can be used instead of payload, more appreciable than payload if you have it
  overrideAccess: false, //
  resolver: 'copy', // pass resolver key
  update: true, // optional, should update immediately or just return the translated result, default false
  data: {}, // Optional, if you want to translate from your data passed here instead of the current doc, should be in "localeFrom" locale, for example { title: "Hello" }
});
```

### Example of the hook that uses local operation to copy the doc data to other locales

```ts
import type { CollectionAfterChangeHook } from 'payload/types';
import { translateOperation } from '@payload-enchants/translator';

export const copyOtherLocales: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return;

  const locale = req.locale;

  if (!locale || !req.payload.config.localization) return;

  const otherLocales = req.payload.config.localization.locales.filter(
    (each) => each.code !== locale,
  );

  const { id } = doc;

  for (const { code } of otherLocales) {
    await translateOperation({
      collectionSlug: collection.slug,
      data: doc,
      id,
      locale: code,
      localeFrom: locale,
      req,
      resolver: 'copy',
      update: true,
    });
  }
};
```

### Omitting fields

To omit a specific field for translation, simply add `custom.translatorSkip = true` to the field's config.

```ts
const field = {
  custom: {
    translatorSkip: true,
  },
  localized: true,
  name: 'skip',
  type: 'text',
};
```
