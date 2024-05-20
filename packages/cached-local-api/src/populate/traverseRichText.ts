import type { Payload } from 'payload';

import type { PopulationItem } from './types';

export const traverseRichText = ({
  data,
  payload,
  populationList,
}: {
  data: any;
  payload: Payload;
  populationList: PopulationItem[];
}): any => {
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item && typeof item === 'object')
        traverseRichText({ data: item, payload, populationList });
    });
  } else if (data && typeof data === 'object') {
    Object.keys(data).forEach((key) => {
      const isRelationship = key === 'value' && 'relationTo' in data;

      if (isRelationship) {
        console.log('here', data);

        const id = data[key] && typeof data[key] === 'object' ? data[key].id : data[key];

        const collection = payload.collections[data.relationTo]?.config;

        if (id && collection)
          populationList.push({
            accessor: 'value',
            collection,
            id,
            ref: data,
          });
      } else {
        if (data[key] && typeof data[key] === 'object')
          traverseRichText({ data: data[key], payload, populationList });
      }
    });
  }
};
