// experimental

import { type GeneratedTypes, type Payload, type RequestContext } from 'payload';
import type { Field, PayloadRequestWithData } from 'payload/types';

import type { FindByID, Populate, Select } from '../types';
import { traverseFields } from './traverseFields';
import type { PopulationItem } from './types';

/**
 * Populate relationships
 * Apply `select`
 */
export const populateDocRelationships = async ({
  context,
  data,
  depth,
  draft,
  fallbackLocale,
  fields,
  findByID,
  locale,
  payload,
  populate,
  req,
  select,
  showHiddenFields,
}: {
  context?: RequestContext;
  currentDepth?: number;
  data: Record<string, any>;
  depth: number;
  draft?: boolean;
  fallbackLocale?: string;
  fields: Field[];
  findByID: FindByID;
  locale?: string;
  payload: Payload;
  populate?: Populate;
  req?: PayloadRequestWithData;
  select?: Select;
  showHiddenFields?: boolean;
}) => {
  if (!depth && !populate && !select) return;

  const populationList: PopulationItem[] = [];

  const populatedPromises: Promise<{
    collection: string;
    id: number | string;
    populate?: Populate;
    select?: Select;
    value: unknown;
  }>[] = [];

  traverseFields({ data, fields, payload, populate, populationList });

  if (populationList.length === 0) return;

  const collections = new Set(populationList.map((each) => each.collection.slug));

  collections.forEach((collection) => {
    const itemsToPopulate = new Set(
      populationList
        .filter((each) => each.collection.slug === collection)
        .map((each) =>
          JSON.stringify({
            id: each.id,
            populate: each.populate,
          }),
        ),
    );

    itemsToPopulate.forEach((itemString) => {
      const { id, populate, select } = JSON.parse(itemString) as {
        id: string;
        populate?: Populate;
        select?: Select;
      };

      populatedPromises.push(
        new Promise(async (resolve) => {
          const doc = await findByID({
            collection: collection as keyof GeneratedTypes['collections'],
            context,
            depth: depth - 1,
            disableErrors: true,
            draft,
            fallbackLocale: fallbackLocale as GeneratedTypes['locale'],
            id,
            locale: locale as GeneratedTypes['locale'],
            populate,
            req,
            select,
            showHiddenFields,
          });

          return resolve({ collection, id, populate, value: doc });
        }),
      );
    });
  });

  const populated = await Promise.all(populatedPromises);

  for (const item of populationList) {
    const populatedDoc = populated.find(
      (each) =>
        each.collection === item.collection.slug &&
        JSON.stringify({
          id: each.id,
          populate: each.populate,
          select: each.select,
        }) ===
          JSON.stringify({
            id: item.id,
            populate: item.populate,
          }),
    )?.value;

    if (!populatedDoc) continue;

    item.ref[item.accessor] = populatedDoc;

    if (depth > 1 || item.populate) {
      await populateDocRelationships({
        context,
        data: item.ref[item.accessor] as Record<string, unknown>,
        depth: depth - 2,
        draft,
        fallbackLocale,
        fields: item.collection.fields,
        findByID,
        locale,
        payload,
        populate: item.populate,
        req,
        showHiddenFields,
      });
    }
  }
};
