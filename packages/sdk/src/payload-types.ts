type PaginatedDocs<T = any> = {
  docs: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage?: null | number | undefined;
  page?: number;
  pagingCounter: number;
  prevPage?: null | number | undefined;
  totalDocs: number;
  totalPages: number;
};

type QueryOperator = [
  'equals',
  'contains',
  'not_equals',
  'in',
  'all',
  'not_in',
  'exists',
  'greater_than',
  'greater_than_equal',
  'less_than',
  'less_than_equal',
  'like',
  'within',
  'intersects',
  'near',
];

type Operator = QueryOperator[number];

type WhereField = {
  [key in Operator]?: unknown;
};

type Where = {
  [key: string]: Where[] | WhereField;
  // @ts-expect-error idk, the same as in Payload
  and?: Where[];
  // @ts-expect-error idk, the same as in Payload
  or?: Where[];
};

type Config = {
  collections: { [key: string]: { id: number | string } & object };
  globals: Record<string, unknown>;
  locale: string;
  user: any;
};

type BulkOperationResult<T extends { id: unknown }> = {
  docs: T[];
  errors: {
    id: T['id'];
    message: string;
  }[];
};

export type { BulkOperationResult, Config, PaginatedDocs, Where };
