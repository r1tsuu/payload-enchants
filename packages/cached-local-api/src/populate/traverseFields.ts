import type { Payload } from 'payload';
import type { Field } from 'payload/types';
import { tabHasName } from 'payload/types';

import type { Populate } from '../types';
import { traverseRichText } from './traverseRichText';
import type { PopulationItem } from './types';

export const traverseFields = ({
  data,
  depth,
  fieldPrefix = '',
  fields,
  payload,
  populate,
  populationList,
}: {
  data: Record<string, any>;
  depth?: number;
  fieldPrefix?: string;
  fields: Field[];
  payload: Payload;
  populate?: Populate;
  populationList: PopulationItem[];
}) => {
  fields.forEach((field) => {
    if (field.type === 'relationship' || field.type === 'upload') {
      const fieldInPopulate = populate?.[`${fieldPrefix}${field.name}`];

      let fieldPopulate: Populate | undefined = undefined;

      if (populate) {
        if (!fieldInPopulate) return;
        if (typeof fieldInPopulate !== 'boolean') {
          fieldPopulate = fieldInPopulate.populate;
        }
      }

      if (
        'hasMany' in field &&
        typeof field.relationTo === 'string' &&
        typeof field.hasMany &&
        Array.isArray(data?.[field.name])
      ) {
        data[field.name].forEach((id: number | string, index: number) => {
          if (typeof id !== 'number' && typeof id !== 'string') return;
          const { config: collection } = payload.collections[field.relationTo as string];

          if (depth || fieldPopulate)
            populationList.push({
              accessor: index,
              collection,
              id,
              populate: fieldPopulate,
              ref: data[field.name],
            });
        });

        return;
      }

      if (
        'hasMany' in field &&
        Array.isArray(field.relationTo) &&
        typeof field.hasMany &&
        Array.isArray(data[field.name])
      ) {
        data[field.name].forEach(
          (
            {
              relationTo,
              value,
            }: {
              relationTo: string;
              value: number | string;
            },
            index: number,
          ) => {
            if (typeof value !== 'number' && typeof value !== 'string') return;
            const { config: collection } = payload.collections[relationTo as string];

            if (depth || fieldPopulate)
              populationList.push({
                accessor: 'value',
                collection,
                id: value,
                populate: fieldPopulate,
                ref: data[field.name][index],
              });
          },
        );

        return;
      }

      if (
        (typeof data?.[field.name] === 'string' || typeof data?.[field.name] === 'number') &&
        typeof field.relationTo === 'string'
      ) {
        const { config: collection } = payload.collections[field.relationTo as string];

        if (depth || fieldPopulate)
          populationList.push({
            accessor: field.name,
            collection,
            id: data[field.name],
            populate: fieldPopulate,
            ref: data,
          });
      }

      if (
        data?.[field.name] &&
        typeof data[field.name] === 'object' &&
        Array.isArray(field.relationTo)
      ) {
        const relationTo = data[field.name].relationTo;

        const { config: collection } = payload.collections[relationTo as string];

        if (
          typeof data[field.name].value === 'string' ||
          typeof data[field.name].value === 'number'
        ) {
          if (depth || fieldPopulate)
            populationList.push({
              accessor: 'value',
              collection,
              id: data[field.name].value,
              populate: fieldPopulate,
              ref: data[field.name],
            });
        }
      }
    }

    if (field.type === 'richText' && data?.[field.name]) {
      if (populate && !populate[data[field.name]]) return;

      traverseRichText({ data: data[field.name], payload, populationList });

      return;
    }

    if (field.type === 'array' && Array.isArray(data?.[field.name])) {
      for (const item of data[field.name]) {
        traverseFields({
          data: item,
          fieldPrefix: `${fieldPrefix}${field.name}.`,
          fields: field.fields,
          payload,
          populate,
          populationList,
        });
      }

      return;
    }

    if (field.type === 'blocks' && Array.isArray(data?.[field.name])) {
      for (const item of data[field.name]) {
        const blockType = item?.blockType;

        if (!blockType) continue;

        const block = field.blocks.find((each) => each.slug === blockType)!;

        traverseFields({
          data: item,
          fieldPrefix: `${fieldPrefix}${field.name}.blockType_${block.slug}.`,
          fields: block.fields,
          payload,
          populate,
          populationList,
        });
      }

      return;
    }

    if (field.type === 'group' && data[field.name] && typeof data[field.name] === 'object') {
      traverseFields({
        data: data[field.name],
        fieldPrefix: `${fieldPrefix}${field.name}.`,
        fields: field.fields,
        payload,
        populate,
        populationList,
      });

      return;
    }

    if (field.type === 'row' || field.type === 'collapsible') {
      traverseFields({ data, fields: field.fields, payload, populationList });

      return;
    }

    if (field.type === 'tabs') {
      field.tabs.forEach((tab) => {
        const tabData = tabHasName(tab) ? data[tab.name] : data;

        const tabPopulatePrefix = tabHasName(tab) ? `${fieldPrefix}.${tab.name}.` : fieldPrefix;

        traverseFields({
          data: tabData,
          fieldPrefix: tabPopulatePrefix,
          fields: tab.fields,
          payload,
          populate,
          populationList,
        });
      });
    }
  });
};
