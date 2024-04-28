import type { PayloadHandler } from 'payload/config';
import { APIError } from 'payload/errors';
import type { Field } from 'payload/types';
import { fieldAffectsData } from 'payload/types';

import type { GetLocalesListHandlerArgs } from '../types';
import { isEmpty } from '../utils/isEmpty';

export const getLocalesListHandler: PayloadHandler = async (req) => {
  const args = (await req.json?.()) as GetLocalesListHandlerArgs;

  const isGlobal = 'globalSlug' in args;

  const slug = isGlobal ? args.globalSlug : args.collectionSlug;

  const entityConfig = (
    isGlobal ? req.payload.config.globals : req.payload.config.collections
  ).find((entity) => entity.slug === slug);

  if (!entityConfig)
    throw new APIError(`This ${isGlobal ? 'global' : 'collection'} slug is invalid - ${slug}`, 400);

  const localizationConfig = req.payload.config.localization;

  if (!localizationConfig || localizationConfig.locales.length < 2)
    throw new APIError('Localization config is disabled or has only 1 language');

  const docPromise = isGlobal
    ? req.payload.findGlobal({ depth: 0, locale: '*', slug })
    : req.payload.findByID({
        collection: slug,
        depth: 0,
        id: args.id,
        locale: '*',
      });

  const localesWithoutCurrent = localizationConfig.locales.filter(
    (each) => each.code !== args.locale,
  );

  let localesList = localesWithoutCurrent.map(({ code }) => ({
    code,
    isEmpty: true,
  }));

  const getEmptyLocales = () => {
    return localesList.filter((each) => each.isEmpty);
  };

  const traverseFields = (fields: Field[], siblingData: Record<string, any>) => {
    for (const field of fields) {
      const emptyLocales = getEmptyLocales();

      if (!emptyLocales.length) return;

      if (!fieldAffectsData(field)) continue;
      const value = siblingData[field.name];

      if (field.localized) {
        if (isEmpty(value)) continue;

        for (const { code } of emptyLocales) {
          const localizedValue = value[code];

          if (!isEmpty(localizedValue))
            localesList = localesList.map((each) => ({
              ...each,
              isEmpty: each.code === code ? false : each.isEmpty,
            }));
        }
        continue;
      }

      if ('fields' in field && Array.isArray(value)) {
        value.forEach((data) => traverseFields(field.fields, data));
      }
    }
  };

  const doc = await docPromise;

  traverseFields(entityConfig.fields, doc);

  return Response.json({
    emptyLocales: getEmptyLocales().map((each) => each.code),
  });
};
