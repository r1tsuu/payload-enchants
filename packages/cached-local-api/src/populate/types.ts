import type { CollectionConfig } from 'payload';

export type PopulationItem = {
  accessor: number | string;
  collection: CollectionConfig;
  id: number | string;
  populated?: {
    id: number | string;
  } & Record<string, unknown>;
  ref: Record<string, unknown>;
};

export type PopulatedPromises = Promise<{
  collection: string;
  id: number | string;
  value: unknown;
}>[];
