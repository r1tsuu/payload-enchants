// experimental

import { type GeneratedTypes, type Payload, type RequestContext } from 'payload';
import type { Field, PayloadRequestWithData } from 'payload/types';

import type { Find, SanitizedArgsContext } from '../types';
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
  overrideAccess,
  payload,
  populatedDocsMap,
  req,
  showHiddenFields,
  user,
}: {
  context?: RequestContext;
  ctx: SanitizedArgsContext;
  currentDepth?: number;
  data: Record<string, any>;
  depth: number;
  draft?: boolean;
  fallbackLocale?: string;
  fields: Field[];
  find: Find;
  locale?: string;
  overrideAccess?: boolean;
  payload: Payload;
  populatedDocsMap: Map<string, Record<string, any>>;
  req?: PayloadRequestWithData;
  showHiddenFields?: boolean;
  user?: Record<string, any>;
}) => {
  if (!depth) return;

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
            !populatedDocsMap.has(`${collection}-${each.id}`),
        )
        .map((each) => {
          return each.id;
        }),
    );

    populatedPromises.push(
      new Promise(async (resolve) => {
        const { docs } = await find({
          collection: collection as keyof GeneratedTypes['collections'],
          context,
          depth: depth - 1,
          disableErrors: true,
          draft,
          fallbackLocale: fallbackLocale as GeneratedTypes['locale'],
          locale: locale as GeneratedTypes['locale'],
          overrideAccess,
          pagination: false,
          populatedDocsMap,
          req,
          showHiddenFields,
          tags: Array.from(ids).map((each) =>
            ctx.buildTagFindByID({
              id: each,
              slug: collection,
            }),
          ),
          user,
          where: {
            id: {
              in: Array.from(ids),
            },
          },
        });

        for (const doc of docs) {
          populatedDocsMap.set(`${collection}-${doc.id}`, doc);
        }

        return resolve({ collection, docs });
      }),
    );
  });

  await Promise.all(populatedPromises);

  await Promise.all(
    populationList.map(async (item) => {
      const populatedDoc = populatedDocsMap.get(`${item.collection.slug}-${item.id}`);

      if (!populatedDoc || typeof populatedDoc !== 'object') {
        return;
      }

      item.ref[item.accessor] = populatedDoc;

      if (depth > 1) {
        await populateDocRelationships({
          context,
          ctx,
          data: item.ref[item.accessor] as Record<string, unknown>,
          depth: depth - 2,
          draft,
          fallbackLocale,
          fields: item.collection.fields,
          find,
          locale,
          overrideAccess,
          payload,
          populatedDocsMap,
          req,
          showHiddenFields,
          user,
        });
      }
    }),
  );
};
