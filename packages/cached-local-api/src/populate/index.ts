// experimental

import { type GeneratedTypes, type Payload, type RequestContext } from 'payload';
import type { Field, PayloadRequestWithData, TypeWithID } from 'payload/types';

import type { Populate, SanitizedArgsContext } from '../types';
import { traverseFields } from './traverseFields';
import type { PopulationItem } from './types';

export const populateDocRelationships = async ({
  context,
  ctx,
  data,
  depth,
  draft,
  fallbackLocale,
  fields,
  find,
  locale,
  payload,
  populate,
  req,
  showHiddenFields,
}: {
  context?: RequestContext;
  ctx: SanitizedArgsContext;
  currentDepth?: number;
  data: Record<string, any>;
  depth: number;
  draft?: boolean;
  fallbackLocale?: string;
  fields: Field[];
  find: Payload['find'];
  locale?: string;
  payload: Payload;
  populate?: Populate;
  populatedDocs?: {
    collection: string;
    id: number | string;
    value: unknown;
  }[];
  req?: PayloadRequestWithData;
  showHiddenFields?: boolean;
}) => {
  if (!depth && !populateDocRelationships) return;

  const populatedDocs = (context?.populatedDocs ?? []) as {
    collection: string;
    id: number | string;
    value: any;
  }[];

  const populationList: PopulationItem[] = [];

  traverseFields({ data, fields, payload, populationList });

  const populatedPromises: Promise<{
    collection: string;
    docs: unknown[];
  }>[] = [];

  const collections = new Set(populationList.map((each) => each.collection.slug));

  collections.forEach((collection) => {
    const ids = new Set(
      populationList
        .filter(
          (each) =>
            each.collection.slug === collection &&
            populatedDocs.findIndex(
              (populated) =>
                populated.id === each.id && populated.collection === each.collection.slug,
            ) === -1,
        )
        .map((each) => {
          return each.id;
        }),
    );

    populatedPromises.push(
      new Promise(async (resolve) => {
        const { docs } = await find({
          collection: collection as keyof GeneratedTypes['collections'],
          context: {
            ...(context ?? {}),
            populatedDocs,
            tags: Array.from(ids).map((each) =>
              ctx.buildTagFindByID({
                id: each,
                slug: collection,
              }),
            ),
          },
          depth: depth - 1,
          disableErrors: true,
          draft,
          fallbackLocale: fallbackLocale as GeneratedTypes['locale'],
          locale: locale as GeneratedTypes['locale'],
          req,
          showHiddenFields,
          where: {
            id: {
              in: Array.from(ids),
            },
          },
        });

        return resolve({ collection, docs });
      }),
    );
  });

  const populated = await Promise.all(populatedPromises);

  for (const populatedItem of populated) {
    for (const doc of populatedItem.docs) {
      populatedDocs.push({
        collection: populatedItem.collection,
        id: (doc as TypeWithID).id,
        value: doc,
      });
    }
  }

  for (const item of populationList) {
    const populatedDoc = populatedDocs.find(
      (each) => each.collection === item.collection.slug && each.id === item.id,
    );

    if (!populatedDoc?.value) continue;

    item.ref[item.accessor] = populatedDoc.value;

    if (depth > 1) {
      await populateDocRelationships({
        context: {
          ...context,
          populatedDocs,
        },
        ctx,
        data: item.ref[item.accessor] as Record<string, unknown>,
        depth: depth - 2,
        draft,
        fallbackLocale,
        fields: item.collection.fields,
        find,
        locale,
        payload,
        populate,
        populatedDocs,
        req,
        showHiddenFields,
      });
    }
  }
};
