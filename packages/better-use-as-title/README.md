# Better `useAsTitle` property for Payload 3.0

[screen-capture.webm](https://github.com/r1tsuu/payload-enchants/assets/64744993/ba3a8e37-3f5e-48a4-ac25-9ea81bc43b01)

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

## Note for data that already exist

You would need to write a custom script that updates all your docs like this

```
payload.update({
  collection: 'posts',
  where: {}
})
```
