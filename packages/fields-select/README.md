# Fields select plugin for Payload 3.0

## Install

`pnpm add @payload-enchants/fields-select`

In your payload.config.ts:

```ts
/// ....
import { fieldsSelect } from '@payload-enchants/fields-select';

export default buildConfig({
  // ...
  plugins: [fieldsSelect()],
});
```

## Description

Adds an option to select fields from Local API / REST API response like with GraphQL
As well solves a problem, when you need only specific fields to populate from relationship field with `defaultSelect` option
Could significally reduce your pages data sizes, especially when they are related to each other.
PR with more powerful version of this to Payload - https://github.com/payloadcms/payload/pull/5942

## Usage

### Local API:

```ts
/** As well findByID **/
payload.find({
  collection: 'posts',
  context: {
    /**
     * Selects:
     * top level id, title fields
     * text field from "nestedGroup" group field
     * all fields from "nestedArray" field
     * "title" field from populated relationship document
     **/
    select: ['id', 'title', 'nestedGroup.text', 'nestedArray', 'relationship.title'],
  },
});
```

### REST API:

Use `select` query parameter, example:
`?select[0]=id&select[1]=title`

### Default Select option for relationship fields

```ts
const linkField: RelationshipField = {
  custom: {
    /** Field will be populated only with id, slug and title fields **/
    defaultSelect: ['id', 'slug', 'title'],
  },
  name: 'link',
  relationTo: 'pages',
};
```
