import ObjectID from 'bson-objectid';
import type { Field } from 'payload';
import { tabHasName } from 'payload/shared';

import { isEmpty } from '../utils/isEmpty';
import { traverseRichText } from './traverseRichText';
import type { ValueToTranslate } from './types';

export const traverseFields = ({
  dataFrom,
  emptyOnly,
  fields,
  localizedParent,
  siblingDataFrom,
  siblingDataTranslated,
  translatedData,
  valuesToTranslate,
}: {
  dataFrom: Record<string, unknown>;
  emptyOnly?: boolean;
  fields: Field[];
  localizedParent?: boolean;
  siblingDataFrom?: Record<string, unknown>;
  siblingDataTranslated?: Record<string, unknown>;
  translatedData: Record<string, unknown>;
  valuesToTranslate: ValueToTranslate[];
}) => {
  siblingDataFrom = siblingDataFrom ?? dataFrom;
  siblingDataTranslated = siblingDataTranslated ?? translatedData;

  for (const field of fields) {
    switch (field.type) {
      case 'tabs':
        for (const tab of field.tabs) {
          const hasName = tabHasName(tab);

          const tabDataFrom = hasName
            ? (siblingDataFrom[tab.name] as Record<string, unknown>)
            : siblingDataFrom;

          if (!tabDataFrom) return;

          const tabDataTranslated = hasName
            ? ((siblingDataTranslated[tab.name] as Record<string, unknown>) ?? {})
            : siblingDataTranslated;

          traverseFields({
            dataFrom,
            emptyOnly,
            fields: tab.fields,
            localizedParent: tab.localized,
            siblingDataFrom: tabDataFrom,
            siblingDataTranslated: tabDataTranslated,
            translatedData,
            valuesToTranslate,
          });
        }

        break;

      case 'group': {
        const groupDataFrom = siblingDataFrom[field.name] as Record<string, unknown>;

        if (!groupDataFrom) break;

        const groupDataTranslated =
          (siblingDataTranslated[field.name] as Record<string, unknown>) ?? {};

        traverseFields({
          dataFrom,
          emptyOnly,
          fields: field.fields,
          localizedParent: field.localized,
          siblingDataFrom: groupDataFrom,
          siblingDataTranslated: groupDataTranslated,
          translatedData,
          valuesToTranslate,
        });

        break;
      }

      case 'array': {
        const arrayDataFrom = siblingDataFrom[field.name] as {
          id: string;
        }[];

        if (isEmpty(arrayDataFrom)) break;

        let arrayDataTranslated =
          (siblingDataTranslated[field.name] as { id: string }[] | undefined) ?? [];

        if (field.localized || localizedParent) {
          if (arrayDataTranslated.length > 0 && emptyOnly) break;

          arrayDataTranslated = arrayDataFrom.map(() => ({
            id: ObjectID().toHexString(),
          }));
        }

        arrayDataTranslated.forEach((item, index) => {
          traverseFields({
            dataFrom,
            emptyOnly,
            fields: field.fields,
            localizedParent: localizedParent ?? field.localized,
            siblingDataFrom: arrayDataFrom[index],
            siblingDataTranslated: item,
            translatedData,
            valuesToTranslate,
          });
        });

        siblingDataTranslated[field.name] = arrayDataTranslated;

        break;
      }

      case 'blocks': {
        const blocksDataFrom = siblingDataFrom[field.name] as {
          blockType: string;
          id: string;
        }[];

        if (isEmpty(blocksDataFrom)) break;

        let blocksDataTranslated =
          (siblingDataTranslated[field.name] as { blockType: string; id: string }[] | undefined) ??
          [];

        if (field.localized || localizedParent) {
          if (blocksDataTranslated.length > 0 && emptyOnly) break;

          blocksDataTranslated = blocksDataFrom.map(({ blockType }) => ({
            blockType,
            id: ObjectID().toHexString(),
          }));
        }

        blocksDataTranslated.forEach((item, index) => {
          const block = field.blocks.find((each) => each.slug === item.blockType);

          if (!block) return;

          traverseFields({
            dataFrom,
            emptyOnly,
            fields: block.fields,
            localizedParent: localizedParent ?? field.localized,
            siblingDataFrom: blocksDataFrom[index],
            siblingDataTranslated: item,
            translatedData,
            valuesToTranslate,
          });
        });

        siblingDataTranslated[field.name] = blocksDataTranslated;

        break;
      }

      case 'collapsible':
      case 'row':
        traverseFields({
          dataFrom,
          emptyOnly,
          fields: field.fields,
          localizedParent,
          siblingDataFrom,
          siblingDataTranslated,
          translatedData,
          valuesToTranslate,
        });
        break;

      // long ass cases here we have
      case 'date':
      case 'checkbox':
      case 'json':
      case 'code':
      case 'email':
      case 'number':
      case 'point':
      case 'radio':
      case 'relationship':
      case 'select':
      case 'upload':
        siblingDataTranslated[field.name] = siblingDataFrom[field.name];

        break;

      case 'text':
      case 'textarea':
        if (field.custom && typeof field.custom === 'object' && field.custom.translatorSkip) break;

        if (!(field.localized || localizedParent) || isEmpty(siblingDataFrom[field.name])) break;
        if (emptyOnly && siblingDataTranslated[field.name]) break;

        // do not translate the block ID or admin-facing label
        if (field.name === 'blockName' || field.name === 'id') {
          break;
        }

        valuesToTranslate.push({
          onTranslate: (translated: string) => {
            siblingDataTranslated[field.name] = translated;
          },
          value: siblingDataFrom[field.name],
        });
        break;

      case 'richText': {
        if (field.custom && typeof field.custom === 'object' && field.custom.translatorSkip) break;
        
        if (!(field.localized || localizedParent) || isEmpty(siblingDataFrom[field.name])) break;
        if (emptyOnly && siblingDataTranslated[field.name]) break;

        const richTextDataFrom = siblingDataFrom[field.name] as object;

        siblingDataTranslated[field.name] = richTextDataFrom;

        if (!richTextDataFrom) break;

        const isSlate = Array.isArray(richTextDataFrom);

        const isLexical = 'root' in richTextDataFrom;

        if (!isSlate && !isLexical) break;

        if (isLexical) {
          const root = (siblingDataTranslated[field.name] as Record<string, unknown>)
            ?.root as Record<string, unknown>;

          if (root)
            traverseRichText({
              onText: (siblingData) => {
                valuesToTranslate.push({
                  onTranslate: (translated: string) => {
                    siblingData.text = translated;
                  },
                  value: siblingData.text,
                });
              },
              root,
            });
        } else {
          for (const root of siblingDataTranslated[field.name] as unknown[]) {
            traverseRichText({
              onText: (siblingData) => {
                valuesToTranslate.push({
                  onTranslate: (translated: string) => {
                    siblingData.text = translated;
                  },
                  value: siblingData.text,
                });
              },
              root: root as Record<string, unknown>,
            });
          }
        }

        break;
      }

      default:
        break;
    }
  }
};
