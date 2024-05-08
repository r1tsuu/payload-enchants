import { translateOperation } from '@payload-enchants/translator';
import type { CollectionAfterChangeHook } from 'payload/types';

export const copyOtherLocales: CollectionAfterChangeHook = async ({
  collection,
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return;

  const locale = req.locale;

  if (!locale || !req.payload.config.localization) return;

  const otherLocales = req.payload.config.localization.locales.filter(
    (each) => each.code !== locale,
  );

  const { id } = doc;

  for (const { code } of otherLocales) {
    await translateOperation({
      collectionSlug: collection.slug,
      data: doc,
      id,
      locale: code,
      localeFrom: locale,
      req,
      resolver: 'copy',
      update: true,
    });
  }
};
