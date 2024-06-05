import ObjectID from 'bson-objectid';
import { type Field, tabHasName } from 'payload/types';

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

  fields.forEach((field) => {
    switch (field.type) {
      case 'tabs':
        field.tabs.forEach((tab) => {
          const hasName = tabHasName(tab);

          const tabDataFrom = hasName
            ? (siblingDataFrom[tab.name] as Record<string, unknown>)
            : siblingDataFrom;

          if (!tabDataFrom) return;

          const tabDataTranslated = hasName
            ? (siblingDataTranslated[tab.name] as Record<string, unknown>) ?? {}
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
        });

        break;

      case 'group':
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

      case 'array':
        const arrayDataFrom = siblingDataFrom[field.name] as {
          id: string;
        }[];

        if (isEmpty(arrayDataFrom)) break;

        const arrayDataTranslated = [] as { id: string }[];

        const currentArrayDataInTranslated = Array.isArray(siblingDataTranslated[field.name])
          ? (siblingDataTranslated[field.name] as { id: string }[])
          : undefined;

        arrayDataFrom.forEach((item, index) => {
          const currentArrayItemInTranslated = currentArrayDataInTranslated?.[index];

          arrayDataTranslated.push({
            // ensure ids are different, Postgres doesn't like the same.
            ...(currentArrayItemInTranslated ?? {}),
            id: currentArrayItemInTranslated?.id ?? ObjectID().toHexString(),
          });

          traverseFields({
            dataFrom,
            emptyOnly,
            fields: field.fields,
            localizedParent: localizedParent ?? field.localized,
            siblingDataFrom: item,
            siblingDataTranslated: arrayDataTranslated[index],
            translatedData,
            valuesToTranslate,
          });
        });

        siblingDataTranslated[field.name] = arrayDataTranslated;

        break;

      case 'blocks':
        const blockDataFrom = siblingDataFrom[field.name] as { blockType: string; id: string }[];

        if (isEmpty(blockDataFrom)) break;

        const currentBlockDataInTranslated = Array.isArray(siblingDataTranslated[field.name])
          ? (siblingDataTranslated[field.name] as { id: string }[])
          : undefined;

        const blockDataTranslated = [] as { blockType: string; id: string }[];

        blockDataFrom.forEach((item, index) => {
          const currentBlockItemInTranslated = currentBlockDataInTranslated?.[index];

          blockDataTranslated.push({
            blockType: item.blockType,
            // ensure ids are different, needed with Postgres
            ...(currentBlockItemInTranslated ?? {}),
            id: currentBlockItemInTranslated?.id ?? ObjectID().toHexString(),
          });

          const block = field.blocks.find((each) => each.slug === item.blockType);

          if (!block) return;

          traverseFields({
            dataFrom,
            emptyOnly,
            fields: block.fields,
            localizedParent,
            siblingDataFrom: item,
            siblingDataTranslated: blockDataTranslated[index],
            translatedData,
            valuesToTranslate,
          });
        });

        siblingDataTranslated[field.name] = blockDataTranslated;

        break;

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
        if (!field.localized && !localizedParent && isEmpty(siblingDataFrom[field.name])) return;
        if (emptyOnly && siblingDataTranslated[field.name]) return;

        valuesToTranslate.push({
          onTranslate: (translated: string) => {
            siblingDataTranslated[field.name] = translated;
          },
          value: siblingDataFrom[field.name],
        });
        break;

      case 'richText':
        if (!field.localized && !localizedParent && isEmpty(siblingDataFrom[field.name])) break;
        if (emptyOnly && siblingDataTranslated[field.name]) return;
        const richTextDataFrom = siblingDataFrom[field.name] as object;

        siblingDataTranslated[field.name] = richTextDataFrom;
        const isSlate = Array.isArray(richTextDataFrom);

        const isLexical = 'root' in richTextDataFrom;

        if (!isSlate && !isLexical) break;

        const root = (
          isLexical
            ? (siblingDataTranslated[field.name] as Record<string, unknown>).root
            : (siblingDataTranslated[field.name] as unknown[])?.[0]
        ) as Record<string, unknown>;

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

        break;

      default:
        break;
    }
  });
};
