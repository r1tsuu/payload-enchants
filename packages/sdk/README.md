# Typescript-Safe Payload API Client

## Install

`pnpm add @payload-enchants/sdk`

## Usage

```ts
import { PayloadApiClient } from '@payload-enchants/sdk';

// Import it from generated types
import { Config } from 'payload-types';

const client = new PayloadApiClient<Config>({
  apiURL: 'http://localhost:3000/api',
});

// The syntax is the same as in the Local API, except for `updateById` and `deleteById` (additional operations)
const data = await client.find({ collection: 'pages' });
```

To rewrite headers, you can pass your `fetcher`

```ts
const client = new PayloadApiClient<Config>({
  apiURL: '',
  fetcher: (url, init) => {
    return fetch(url, {
      ...(init ?? {}),
      headers: {
        ...(init?.headers ?? {}),
        Authorization: 'API-Key users some-api-key',
      },
    });
  },
});
```

### Fields selection

This package provides integratation with [@payload-enchants/fields-select](../fields-select/) plugin

```ts
const { docs } = await client.find({ collection: 'pages', select: ['id', 'createdAt'] });

docs[0].createdAt; // ok
docs[0].id; // ok
docs[0].updatedAt; // err, Property 'updatedAt' does not exist on type 'Pick<Page, "id" | "createdAt">'
```
