import type { CollectionConfig, Field } from 'payload';
import { fieldAffectsData, tabHasName } from 'payload/shared';

import { withDefaultFields } from './withDefaultFields';

export const applySelect = ({
  collections,
  data,
  fields,
  level = 0,
  path = '',
  sanitizeExternals,
  select,
}: {
  collections: CollectionConfig[];
  data: any;
  fields: Field[];
  level?: number;
  path?: string;
  sanitizeExternals?: boolean;
  select?: string[];
}) => {
  fields.forEach((field) => {
    if (field.type === 'tabs') {
      field.tabs.forEach((tab) => {
        if (!tabHasName(tab)) {
          return applySelect({
            collections,
            data,
            fields: tab.fields,
            level,
            path,
            sanitizeExternals,
            select,
          });
        }

        if (!data[tab.name]) return;

        if (select?.includes(`${path}${tab.name}`)) return;

        if (
          select &&
          !select.some((selectPath) => `${selectPath}.`.startsWith(`${path}${tab.name}`))
        ) {
          delete data[tab.name];

          return;
        }

        applySelect({
          collections,
          data: data[tab.name],
          fields: tab.fields,
          level: level + 1,
          path: `${path}${tab.name}.`,
          sanitizeExternals,
          select,
        });
      });
    }

    if (field.type === 'relationship' || field.type === 'upload') {
      let useDefaultSelect = true;

      if (select && !select.includes(`${path}${field.name}`)) {
        if (select.some((selectPath) => `${selectPath}.`.startsWith(`${path}${field.name}`))) {
          useDefaultSelect = false;
        } else if (!Array.isArray(field.custom?.defaultSelect)) {
          delete data[field.name];

          return;
        }
      }

      if (useDefaultSelect && Array.isArray(field.custom?.defaultSelect)) {
        field.custom.defaultSelect.forEach((val) => select?.push(`${path}${field.name}.${val}.`));
      }

      if (
        (!('hasMany' in field) || !field.hasMany) &&
        typeof data[field.name] === 'object' &&
        data[field.name] &&
        Array.isArray(field.relationTo)
      ) {
        const collection = collections.find((each) => each.slug === data[field.name].relationTo);

        if (!collection || !data[field.name]?.value || typeof data[field.name].value !== 'object')
          return;

        applySelect({
          collections,
          data: data[field.name].value,
          fields: withDefaultFields(collection),
          level: level + 1,
          path: useDefaultSelect ? '' : `${path}${field.name}.`,
          sanitizeExternals,
          select: useDefaultSelect ? (field.custom?.defaultSelect as string[]) : select,
        });
      }

      if (
        (!('hasMany' in field) || !field.hasMany) &&
        typeof data[field.name] === 'object' &&
        data[field.name] &&
        !Array.isArray(field.relationTo)
      ) {
        const collection = collections.find((each) => each.slug === field.relationTo);

        if (!collection) return;

        applySelect({
          collections,
          data: data[field.name],
          fields: withDefaultFields(collection),
          level: level + 1,
          path: useDefaultSelect ? '' : `${path}${field.name}.`,
          sanitizeExternals,
          select: useDefaultSelect ? (field.custom?.defaultSelect as string[]) : select,
        });
      }

      if (
        'hasMany' in field &&
        field.hasMany &&
        Array.isArray(data[field.name]) &&
        Array.isArray(field.relationTo)
      ) {
        data[field.name].forEach((value: any) => {
          if (
            value &&
            typeof value === 'object' &&
            value.value &&
            typeof value.value === 'object' &&
            Array.isArray(field.relationTo)
          ) {
            const collection = collections.find((each) => each.slug === value.relationTo);

            if (!collection) return;

            applySelect({
              collections,
              data: value.value,
              fields: withDefaultFields(collection),
              level: level + 1,
              path: useDefaultSelect ? '' : `${path}${field.name}.`,
              sanitizeExternals,
              select: useDefaultSelect ? (field.custom?.defaultSelect as string[]) : select,
            });
          }
        });
      }

      if (
        'hasMany' in field &&
        field.hasMany &&
        Array.isArray(data[field.name]) &&
        !Array.isArray(field.relationTo)
      ) {
        data[field.name].forEach((value: any) => {
          if (value && typeof value === 'object' && !Array.isArray(field.relationTo)) {
            const collection = collections.find((each) => each.slug === field.relationTo);

            if (!collection) return;

            applySelect({
              collections,
              data: value,
              fields: withDefaultFields(collection),
              level: level + 1,
              path: useDefaultSelect ? '' : `${path}${field.name}.`,
              sanitizeExternals,
              select: useDefaultSelect ? (field.custom?.defaultSelect as string[]) : select,
            });
          }
        });
      }

      return;
    }

    if (fieldAffectsData(field)) {
      if (select?.includes(`${path}${field.name}`)) return;

      if (
        select &&
        !select.some((selectPath) => `${selectPath}.`.startsWith(`${path}${field.name}`))
      ) {
        delete data[field.name];

        return;
      }

      if (field.type === 'array' || field.type === 'blocks') {
        if (!Array.isArray(data[field.name])) return;

        data[field.name].forEach((value: any) => {
          if ('fields' in field) {
            applySelect({
              collections,
              data: value,
              fields: field.fields,
              level: level + 1,
              path: `${path}${field.name}.`,
              sanitizeExternals,
              select,
            });
          }

          if ('blocks' in field) {
            const currentBlock = field.blocks.find((each) => each.slug === value.blockType);

            if (!currentBlock) return;

            applySelect({
              collections,
              data: value,
              fields: [
                ...currentBlock.fields,
                {
                  name: 'blockType',
                  type: 'text',
                },
              ],
              level: level + 1,
              path: `${path}${field.name}.`,
              sanitizeExternals,
              select,
            });
          }
        });
      }

      if (field.type === 'group') {
        if (typeof data[field.name] !== 'object') return;

        applySelect({
          collections,
          data: data[field.name],
          fields: field.fields,
          level: level + 1,
          path: `${path}${field.name}.`,
          sanitizeExternals,
          select,
        });
      }
    }

    if (field.type === 'row' || field.type === 'collapsible') {
      applySelect({
        collections,
        data,
        fields: field.fields,
        level,
        path,
        sanitizeExternals,
        select,
      });
    }
  });
};
