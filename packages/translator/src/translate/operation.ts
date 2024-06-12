import ObjectID from 'bson-objectid';
import { APIError } from 'payload/errors';
import type { Payload, PayloadRequest } from 'payload/types';

import type { TranslateResolver } from '../resolvers/types';
import { findEntityWithConfig } from './findEntityWithConfig';
import { traverseFields } from './traverseFields';
import type { TranslateArgs, TranslateResult, ValueToTranslate } from './types';
import { updateEntity } from './updateEntity';

export type TranslateOperationArgs = (
  | {
    payload: Payload;
  }
  | {
    req: PayloadRequest;
  }
) &
  TranslateArgs;

// target nested elements with potentially duplicated IDs that are not blocks
function objNeedsNewId(val: unknown): val is { id: string } {
  return (
    typeof val === 'object' &&
    val !== null &&
    'id' in val &&
    !('blockType' in val) &&
    typeof val.id === 'string'
  );
}

function stripNodeIds(obj: unknown) {
  // recursive function to iterate through nested properties
  const recurse = (item: unknown) => {
    if (Array.isArray(item)) {
      // recurse through each element in the array
      item.forEach((subItem) => {
        recurse(subItem);
      });
    } else if (typeof item === 'object' && item !== null) {
      // check if the object has an 'id' attr
      if (objNeedsNewId(item)) {
        const newId = new ObjectID().toHexString();

        item.id = newId;
      }

      // recurse through each property
      Object.entries(item).forEach(([, value]) => {
        recurse(value);
      });
    }
  };

  // Start the iteration with the root object
  recurse(obj);
}

export const translateOperation = async (args: TranslateOperationArgs) => {
  const req: PayloadRequest =
    'req' in args
      ? args.req
      : ({
        payload: args.payload,
      } as PayloadRequest);

  const { collectionSlug, globalSlug, id, locale, localeFrom, overrideAccess } = args;

  const { config, doc: dataFrom } = await findEntityWithConfig({
    collectionSlug,
    globalSlug,
    id,
    locale: localeFrom,
    req,
  });

  const resolver = (
    (req.payload.config.custom?.translator?.resolvers as TranslateResolver[]) ?? []
  ).find((each) => each.key === args.resolver);

  if (!resolver) throw new APIError(`Resolver with the key ${args.resolver} was not found`);

  const valuesToTranslate: ValueToTranslate[] = [];

  let translatedData = args.data;

  if (!translatedData) {
    const { doc } = await findEntityWithConfig({
      collectionSlug,
      globalSlug,
      id,
      locale,
      overrideAccess,
      req,
    });

    translatedData = doc;
  }

  traverseFields({
    dataFrom,
    emptyOnly: args.emptyOnly,
    fields: config.fields,
    translatedData,
    valuesToTranslate,
  });

  const resolveResult = await resolver.resolve({
    localeFrom: args.localeFrom,
    localeTo: args.locale,
    req,
    texts: valuesToTranslate.map((each) => each.value),
  });

  let result: TranslateResult;

  if (!resolveResult.success) {
    result = {
      success: false,
    };
  } else {
    resolveResult.translatedTexts.forEach((translated, index) => {
      valuesToTranslate[index].onTranslate(translated);
    });

    stripNodeIds(translatedData);

    if (args.update) {
      await updateEntity({
        collectionSlug,
        data: translatedData,
        depth: 0,
        globalSlug,
        id,
        locale,
        overrideAccess,
        req,
      });
    }

    result = {
      success: true,
      translatedData,
    };
  }

  return result;
};
