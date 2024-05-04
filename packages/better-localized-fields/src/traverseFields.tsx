import type { Field } from 'payload/types';

import { attachLocalizedField } from './attachLocalizedField';
import type { LocalizedFieldsIndicatorPluginOptions } from './types';

export const traverseFields = ({
  fields,
  options,
}: {
  fields: Field[];
  options: LocalizedFieldsIndicatorPluginOptions;
}) => {
  fields.forEach((field) => {
    switch (field.type) {
      case 'checkbox':
      case 'code':
      case 'number':
      case 'text':
      case 'relationship':
      case 'radio':
      case 'select':
      case 'textarea':
      case 'json':
      case 'date':
      case 'upload':
      case 'email':
      case 'point':
      case 'richText':
        if (field.localized) attachLocalizedField({ field });
        break;

      case 'array':
      case 'group':
        if (field.localized) {
          attachLocalizedField({ field });
          break;
        }

        traverseFields({
          fields: field.fields,
          options,
        });
        break;

      case 'blocks':
        if (field.localized) {
          attachLocalizedField({ field });
          break;
        }
        field.blocks.forEach((block) => {
          traverseFields({
            fields: block.fields,
            options,
          });
        });
        break;

      case 'row':
      case 'collapsible':
        traverseFields({
          fields: field.fields,
          options,
        });
        break;

      case 'tabs':
        field.tabs.forEach((tab) => {
          tab.admin?.components?.Field;
          traverseFields({
            fields: tab.fields,
            options,
          });
        });
        break;
    }
  });
};
