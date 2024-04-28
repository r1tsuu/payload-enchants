import type { Field } from 'payload/types';

import { isEmpty } from '../../utils/isEmpty';
import type { LocalesList } from './types';

export const traverseFields = ({
  fields,
  localesList,
  siblingData,
}: {
  fields: Field[];
  localesList: LocalesList;
  siblingData: Record<string, unknown>;
}) => {
  const emptyLocales = localesList.filter((each) => each.isEmpty);

  if (!emptyLocales.length) return localesList;

  for (const field of fields) {
    if ('localized' in field) {
    }
  }

  return localesList;
};
