import { Field } from 'payload/types';

// Returns keys that only localized
// [
//   "title",
//   "content.0.title",
//   "content.0.description",
//   "content.0.list.0.title",
//   "slug",
//   "meta.title",
//   "meta.description",
// ];

export const templateWithLocalizedFields = (fields: Field[]) => {
  const paths: string[] = [];

  const deepFields = (fields: Field[], basepath = '', localizedParent = false) => {
    for (const field of fields) {
      if (field.type === 'text' || field.type === 'textarea' || field.type === 'richText') {
        if (localizedParent || field.localized) {
          paths.push(basepath + field.name);
        }
      } else if (field.type === 'group') {
        deepFields(field.fields, basepath + field.name + '.', field.localized);
      } else if (field.type === 'array') {
        deepFields(field.fields, basepath + field.name + '.0.');
      } else if (field.type === 'blocks') {
        for (const block of field.blocks) {
          deepFields(block.fields, basepath + field.name + `.0.`);
        }
      } else if (field.type === 'tabs') {
        for (const tab of field.tabs as any) {
          if (tab.name) {
            deepFields(tab.fields, basepath + tab.name + '.');
          } else deepFields(tab.fields, basepath);
        }
      }
    }
  };

  deepFields(fields);

  return paths;
};

const replaceNumbers = (inputString: string, replacement: string) => {
  const regex = /\.\d+\./g;
  return inputString.replace(regex, `.${replacement}.`);
};

export const filterObjectByTemplate = (
  template: string[],
  obj: { [key: string]: any },
  translateOnlyEmptyFields: boolean
) => {
  const filteredEntries = Object.entries(obj).filter(([key, value]) => {
    if (typeof value === 'number') return null;
    return translateOnlyEmptyFields
      ? !value || !value?.length
      : true && template.includes(replaceNumbers(key, '0'));
  });

  return filteredEntries.flatMap((each) => each[0]);
};
