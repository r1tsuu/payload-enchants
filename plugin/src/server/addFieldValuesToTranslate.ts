import type { Field } from 'payload/types';

import type { ValueToTranslate } from './types';

export const addFieldValuesToTranslate = ({
  field,
  // localeFrom,
  name,
  siblingData,
  // localeTo,
  valueFrom,
  valuesToTranslate,
}: {
  field: Field;
  localeFrom: string;
  localeTo: string;
  name: string;
  siblingData: Record<string, any>;
  valueFrom: any;
  valuesToTranslate: ValueToTranslate[];
}) => {
  if (field.type === 'richText') {
    if (typeof valueFrom !== 'object') return valueFrom;

    const isSlate = Array.isArray(valueFrom);

    const isLexical = 'root' in valueFrom;

    if (!isSlate && !isLexical) return valueFrom;

    siblingData[name] = valueFrom;

    const root = isLexical ? valueFrom.root : valueFrom;

    const traverseChilds = (siblingData: any) => {
      if (siblingData.text) {
        valuesToTranslate.push({
          onTranslate: (value) => (siblingData.text = value),
          value: siblingData.text,
        });
      }
      if (Array.isArray(siblingData.children)) {
        for (const child of siblingData.children) {
          traverseChilds(child);
        }
      }
    };

    traverseChilds(root);

    return valueFrom;
  }

  return valuesToTranslate.push({
    onTranslate: (value) => (siblingData[name] = value),
    value: valueFrom,
  });
};
