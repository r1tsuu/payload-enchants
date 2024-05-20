# Cached Local API for Payload 3.0 using Next.js `unstable_cache` (experimental)

## Description:

This package allows to cache the following operations:

1. `find`
2. `findByID`
3. `findOne` - new operation, find one by specific field, for example slug
4. `findGlobal`
5. `count`

It also works with relationships using a custom population method, meaning that when a related document changes, we aren't revalidating the current document, but instead the result of findByID for the related document.
Currently there's no support for relations inside of Rich Text fields.

## Install

`pnpm add @payload-enchants/cached-local-api`

Add to the separated file

```ts
import { buildCachedPayload } from '@payload-enchants/cached-local-api';
import { revalidateTag, unstable_cache } from 'next/cache';

export const { cachedPayloadPlugin, getCachedPayload } = buildCachedPayload({
  // collections list to cache
  collections: [{ slug: 'posts' }],
  // globals list to cache
  globals: [{ slug: 'header' }],
  revalidateTag,
  // options, details are below
  options: {},
  unstable_cache,
});
```

Add into your payload.config.ts:

```ts
import { cachedPayloadPlugin } from './cached-local-api';

export default buildConfig({
  // ...your config
  plugins: [cachedPayloadPlugin],
});
```

## Example of the usage on Next Page

```tsx
import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';

import { getCachedPayload } from '../../../cached-local-api';

const Page = async () => {
  const payload = await getPayloadHMR({
    config: configPromise,
  });

  const cachedPayload = getCachedPayload(payload);

  const posts = await cachedPayload.find({ collection: 'posts' });

  return (
    <div>
      {posts.docs.map((each) => (
        <div key={each.id}>{each.title}</div>
      ))}
    </div>
  );
};

export default Page;
```

### Args

```ts
export type Args = {
  /** List of collections slugs that should use cache */
  collections?: Array<{
    /** array with the fields to use in findOne (name or config, see below) */
    findOneFields?: (FindOneFieldConfig | string)[];

    slug: keyof GeneratedTypes['collections'];
  }>;

  /** List of globals slugs that should use cache */
  globals?: Array<{
    slug: keyof GeneratedTypes['globals'];
  }>;

  /** Additional options */
  options?: Options;

  /** Next.js revalidateTag */
  revalidateTag: (tag: string) => void;

  /** Next.js unstable_cache */
  unstable_cache: UnstableCache;
};

export type FindOneFieldConfig = {
  /** @default "where: { equals: value }" */
  buildWhere?: (valueToSearch: unknown) => Where;

  /** @default "doc[fieldName]" */
  getFieldFromDoc?: (doc: Record<string, any>) => unknown;
  name: string;
};
```

## Options

```ts
export type Options = {
  // custom tag build
  buildTagFind?: (args: { slug: string }) => string;
  buildTagFindByID?: (args: { id: number | string; slug: string }) => string;
  buildTagFindGlobal?: (args: { slug: string }) => string;

  // If not provided - returns `true`
  shouldCacheCountOperation?: (args: CountArgs) => Promise<boolean> | boolean;
  shouldCacheFindByIDOperation?: (args: FindByIDArgs) => Promise<boolean> | boolean;
  shouldCacheFindGlobalOperation?: (args: FindGlobalArgs) => Promise<boolean> | boolean;
  shouldCacheFindOperation?: (args: FindArgs) => Promise<boolean> | boolean;

  // If not provided - returns `true`
  shouldRevalidateGlobalOnChange?: (
    args: Parameters<GlobalAfterChangeHook>[0],
  ) => Promise<boolean> | boolean;
  shouldRevalidateOnChange?: (
    args: Parameters<CollectionAfterChangeHook>[0],
  ) => Promise<boolean> | boolean;
  shouldRevalidateOnDelete?: (
    args: Parameters<CollectionAfterDeleteHook>[0],
  ) => Promise<boolean> | boolean;
};
```
