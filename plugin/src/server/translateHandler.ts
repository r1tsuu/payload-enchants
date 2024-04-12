import httpStatus from 'http-status';
import type { PayloadHandler } from 'payload/config';
import { APIError } from 'payload/errors';
import { type Field, fieldAffectsData } from 'payload/types';

import type { TranslateResolver } from '../resolvers/types';
import type { TranslateHandlerArgs } from '../types';
import { isEmpty } from '../utils/isEmpty';
import { addFieldValuesToTranslate } from './addFieldValuesToTranslate';
import type { ValueToTranslate } from './types';

export const getTranslateHandler: (resolver: TranslateResolver) => PayloadHandler =
  (resolver) => async (req) => {
    const args = req.data as TranslateHandlerArgs;

    const isGlobal = 'globalSlug' in args;

    const slug = isGlobal ? args.globalSlug : args.collectionSlug;

    const entityConfig = (
      isGlobal ? req.payload.config.globals : req.payload.config.collections
    ).find((entity) => entity.slug === slug);

    if (!entityConfig)
      throw new APIError(
        `This ${isGlobal ? 'global' : 'collection'} slug is invalid - ${slug}`,
        httpStatus.BAD_REQUEST,
      );

    const localizationConfig = req.payload.config.localization;

    if (!localizationConfig || localizationConfig.locales.length < 2)
      throw new APIError('Localization config is disabled or has only 1 language');

    const docFromPromise = isGlobal
      ? req.payload.findGlobal({ depth: 0, locale: args.localeFrom, slug })
      : req.payload.findByID({
          collection: slug,
          depth: 0,
          id: args.id,
          locale: args.localeFrom,
        });

    const doc = await docFromPromise;

    const valuesToTranslate: ValueToTranslate[] = [];

    const traverseFields = (
      fields: Field[],
      siblingData: Record<string, any>,
      siblingDataFrom: Record<string, any>,
    ) => {
      for (const field of fields) {
        if (!fieldAffectsData(field)) continue;
        const name = field.name;

        const value = siblingData[name];

        const valueFrom = siblingDataFrom[name];

        if (field.localized) {
          if (value && args.emptyOnly) continue;
          if (valueFrom) {
            addFieldValuesToTranslate({
              field,
              localeFrom: args.localeFrom,
              localeTo: args.locale,
              name,
              siblingData,
              valueFrom,
              valuesToTranslate,
            });
            continue;
          }
        }

        if ('fields' in field) {
          if (Array.isArray(value) && Array.isArray(valueFrom)) {
            value.forEach((data, index) => traverseFields(field.fields, data, valueFrom[index]));
            continue;
          }

          if (field.type === 'group' && !isEmpty(value) && !isEmpty(valueFrom))
            traverseFields(field.fields, value, valueFrom);
        }

        if ('blocks' in field) {
          if (Array.isArray(value) && Array.isArray(valueFrom)) {
            value.forEach((data, index) => {
              const blockField = field.blocks.find((block) => block.slug === data.blockType);

              if (!blockField) return;

              traverseFields(blockField.fields, data, valueFrom[index]);
            });
          }
        }
      }
    };

    traverseFields(entityConfig.fields, args.data, doc);

    const { translatedTexts } = await resolver({
      localeFrom: args.locale,
      localeTo: args.localeFrom,
      req,
      texts: valuesToTranslate.map((each) => each.value),
    });

    await Promise.all(
      valuesToTranslate.map((each, index) => each.onTranslate(translatedTexts[index])),
    );

    return Response.json({
      translatedData: args.data,
    });
  };
