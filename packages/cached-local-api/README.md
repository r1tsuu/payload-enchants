# Cached Local API for Payload 3.0 using Next.js `unstable_cache`

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
