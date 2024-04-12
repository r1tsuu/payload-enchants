import type { Field } from 'payload/types';
import { fieldAffectsData } from 'payload/types';

export const canFieldBeTranslated = (field: Field) => {
  if (!fieldAffectsData(field)) return false;
};
