# Better `useAsTitle` property for Payload 3.0

## Install

`pnpm add @payload-enchants/better-use-as-title`

Add into your payload.config.ts:

```ts
import { betterUseAsTitle } from '@payload-enchants/better-use-as-title';

export default buildConfig({
  // ...your config
  plugins: [
    betterUseAsTitle({
      // List of collections to apply a custom `useAsTitle`
      collections: [
        {
          // Collection slug
          slug: 'better-use-as-title-test',

          // `data` is the current document data, req is instance of PayloadRequest, from which you can get `payload` and `user`
          // could be asynchronous as well
          useAsTitle: ({ data, req }) =>
            `${data.firstName ?? ''} - ${data.secondName}, ${data.age} y.o`,

          // override properties for useAsTitle field for this collection
          fieldOverride: {
            name: 'customNameForCollection',
          },
        },
      ],
      // override properties for useAsTitle field globally
      fieldOverride: {
        name: 'customName',
      },
    }),
  ],
});
```
