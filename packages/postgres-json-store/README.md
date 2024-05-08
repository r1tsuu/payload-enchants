# Docs reorder plugin for Payload 3.0 beta

## Install

`pnpm add @payload-enchants/docs-reorder`

## About

Adds an option to re-order collection documents with drag n drop (almost like array/blocks items). Then on your front end you can query documents with applied sort by `docOrder` field.

## Video

https://github.com/r1tsuu/payload-plugin-collections-docs-order/assets/64744993/2c13cdd9-f809-4c40-82c6-0b6f78997f74

In your payload.config.ts:

```ts
/// ....
import { docsReorder } from '@payload-enchants/docs-reorder';

export default buildConfig({
  // ...
  plugins: [
    docsReorder({
      collections: [{ slug: 'pages' }], // The feature will be enabled only for collections that are in this array.,
      access: ({ req, data }) => {
        // Optional, configure access for `saveChanges` endpoint, default: Boolean(req.user)
        return req.user?.collection === 'admins';
      },
    }),
  ],
});
```

## Querying with applied plugin's sort.

REST:

```ts
fetch('http://localhost:3000/api/examples?sort=docOrder').then((res) => res.json());
```

Local API:

```ts
payload.find({ collection: 'examples', sort: 'docOrder' });
```

GraphQL:

```graphql
query {
  Examples(sort: "docOrder") {
    docs {
      title
    }
  }

```

## Script to setup for collections that had documents before installing the plugin

1. Place [this file](../../test/src/scripts/docsReorderSetupScript.ts) to your src/scripts directory
2. Change here list to your list of collection slugs with enabled plugin

```ts
const collections: (keyof GeneratedTypes['collections'])[] = ['docs-reoder-examples'];
```

3. Run pnpm tsx ./src/scripts/docsReorderSetupScript.ts
