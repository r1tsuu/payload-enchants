// experimental

import { type GeneratedTypes, type Payload, type RequestContext } from 'payload';
import type { Field, PayloadRequestWithData } from 'payload/types';

import type { Populate } from '../types';
import { traverseFields } from './traverseFields';
import type { PopulationItem } from './types';

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
  showHiddenFields,
}: {
  context?: RequestContext;
  currentDepth?: number;
  data: Record<string, any>;
  depth: number;
  draft?: boolean;
  fallbackLocale?: string;
  fields: Field[];
  findByID: Payload['findByID'];
  locale?: string;
  payload: Payload;
  populate?: Populate;
  req?: PayloadRequestWithData;
  showHiddenFields?: boolean;
}) => {
  if (!depth && !populateDocRelationships) return;

  const populationList: PopulationItem[] = [];

  const populatedPromises: Promise<{
    collection: string;
    id: number | string;
    value: unknown;
  }>[] = [];

  traverseFields({ data, fields, payload, populationList });

  const collections = new Set(populationList.map((each) => each.collection.slug));

  collections.forEach((collection) => {
    const ids = new Set(
      populationList.filter((each) => each.collection.slug === collection).map((each) => each.id),
    );

    ids.forEach((id) => {
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
            req,
            showHiddenFields,
          });

          return resolve({ collection, id, value: doc });
        }),
      );
    });
  });

  const populated = await Promise.all(populatedPromises);

  for (const item of populationList) {
    const populatedDoc = populated.find(
      (each) => each.collection === item.collection.slug && each.id === item.id,
    )?.value;

    if (!populatedDoc) continue;

    item.ref[item.accessor] = populatedDoc;

    if (depth > 1) {
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
        populate,
        req,
        showHiddenFields,
      });
    }
  }
};
