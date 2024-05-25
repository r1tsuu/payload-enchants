import type { CollectionConfig } from 'payload/types';

import type { Populate, Select } from '../types';

export type PopulationItem = {
  accessor: number | string;
  collection: CollectionConfig;
  id: number | string;
  populate?: Populate;
  populated?: {
    id: number | string;
  } & Record<string, unknown>;
  ref: Record<string, unknown>;
  select?: Select;
};
