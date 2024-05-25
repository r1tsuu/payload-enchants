import type { GeneratedTypes, Payload } from 'payload';
import type payload from 'payload';
import type { Plugin } from 'payload/config';
import type { PaginatedDocs } from 'payload/database';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Where,
} from 'payload/types';

type Callback = (...args: any[]) => Promise<any>;

type UnstableCache = <T extends Callback>(
  cb: T,
  keyParts?: string[],
  options?: {
    /**
     * The revalidation interval in seconds.
     */
    revalidate?: false | number;
    tags?: string[];
  },
) => T;

export type Select = string[];

export type Populate = Record<
  string,
  | {
      populate?: Populate;
      select?: Select;
    }
  | true
>;

export type Find = <T extends keyof GeneratedTypes['collections']>(
  args: FindArgs<T>,
) => Promise<PaginatedDocs<GeneratedTypes['collections'][T]>>;

export type FindArgs<T extends keyof GeneratedTypes['collections']> = {
  populate?: Populate;
  select?: Select;
} & Parameters<typeof payload.find<T>>[0];

export type FindOneArgs<T extends keyof GeneratedTypes['collections']> = {
  /** @default first field from the fields array */
  field?: string;
  populate?: Populate;
  select?: Select;
  value: string;
  // eslint-disable-next-line perfectionist/sort-intersection-types
} & Omit<Parameters<Find>[0], 'limit' | 'page' | 'pagination' | 'where'> & {
    collection: T;
  };

export type FindOne = <T extends keyof GeneratedTypes['collections']>(
  args: FindOneArgs<T>,
) => Promise<GeneratedTypes['collections'][T] | null>;

export type FindByID = <T extends keyof GeneratedTypes['collections']>(
  args: FindByIDArgs<T>,
) => Promise<GeneratedTypes['collections'][T]>;

export type FindByIDArgs<T extends keyof GeneratedTypes['collections']> = {
  populate?: Populate;
  select?: Select;
} & Parameters<typeof payload.findByID<T>>[0];

export type FindGlobal = <T extends keyof GeneratedTypes['globals']>(
  args: FindGlobalArgs<T>,
) => Promise<GeneratedTypes['globals'][T]>;

export type FindGlobalArgs<T extends keyof GeneratedTypes['globals']> = {
  populate?: Populate;
  select?: Select;
} & Parameters<typeof payload.findGlobal<T>>[0];

export type Count = Payload['count'];

export type CountArgs<T extends keyof GeneratedTypes['collections']> = Parameters<
  typeof payload.count<T>
>[0];

export type FindOneFieldConfig = {
  buildWhere?: (args: {
    args: FindOneArgs<any>;
    fieldName: string;
    shouldCache: boolean;
    value: unknown;
  }) => Where;
  getFieldFromDoc?: (doc: Record<string, any>) => unknown;
  name: string;
};

export type Extension = (args: Omit<Args, 'extensions'>) => Omit<Args, 'extensions'>;

export type Args = {
  collections?: Array<{
    findOneFields?: (FindOneFieldConfig | string)[];
    slug: keyof GeneratedTypes['collections'];
  }>;
  extensions?: Extension[];
  globals?: Array<{
    slug: keyof GeneratedTypes['globals'];
  }>;
  loggerDebug?: boolean;
  options?: {
    buildTagFind?: (args: { slug: string }) => string;
    buildTagFindByID?: (args: { id: number | string; slug: string }) => string;
    buildTagFindGlobal?: (args: { slug: string }) => string;
    buildTagFindOne?: (args: { fieldName: string; slug: string }) => string;
    shouldCacheCountOperation?: (args: CountArgs<any>) => Promise<boolean> | boolean;
    shouldCacheFindByIDOperation?: (args: FindByIDArgs<any>) => Promise<boolean> | boolean;
    shouldCacheFindGlobalOperation?: (args: FindGlobalArgs<any>) => Promise<boolean> | boolean;
    shouldCacheFindOneOperation?: (args: FindOneArgs<any>) => Promise<boolean> | boolean;
    shouldCacheFindOperation?: (args: FindArgs<any>) => Promise<boolean> | boolean;
    shouldRevalidateGlobalOnChange?: (
      args: Parameters<GlobalAfterChangeHook>[0],
    ) => Promise<boolean> | boolean;
    shouldRevalidateOnChange?: (
      args: Parameters<CollectionAfterChangeHook>[0],
    ) => Promise<boolean> | boolean;
    shouldRevalidateOnDelete?: (
      args: Parameters<CollectionAfterDeleteHook>[0],
    ) => Promise<boolean> | boolean;
  };
  revalidateTag: (tag: string) => void;
  unstable_cache: UnstableCache;
};

export type SanitizedArgsContext = {
  buildTagFind: (args: { slug: string }) => string;
  buildTagFindByID: (args: { id: number | string; slug: string }) => string;
  buildTagFindGlobal: (args: { slug: string }) => string;
  buildTagFindOne: (args: { fieldName: string; slug: string; value: unknown }) => string;
  collections: Array<{ findOneFields: Required<FindOneFieldConfig>[]; slug: string }>;
  debugLog: (args: { message: string; payload: Payload }) => void;
  globals: Array<{ slug: string }>;
  revalidateTag: (tag: string) => void;
  revalidateTags: (args: {
    operation: 'CREATE' | 'DELETE' | 'DELETE-BULK' | 'UPDATE' | 'UPDATE-BULK';
    payload: Payload;
    tags: string[];
  }) => void;
  shouldCacheCountOperation: (args: CountArgs<any>) => Promise<boolean> | boolean;
  shouldCacheFindByIDOperation: (args: FindByIDArgs<any>) => Promise<boolean> | boolean;
  shouldCacheFindGlobalOperation: (args: FindGlobalArgs<any>) => Promise<boolean> | boolean;
  shouldCacheFindOneOperation: (args: FindOneArgs<any>) => Promise<boolean> | boolean;
  shouldCacheFindOperation: (args: FindArgs<any>) => Promise<boolean> | boolean;
  shouldRevalidateGlobalOnChange: (
    args: Parameters<GlobalAfterChangeHook>[0],
  ) => Promise<boolean> | boolean;
  shouldRevalidateOnChange: (
    args: Parameters<CollectionAfterChangeHook>[0],
  ) => Promise<boolean> | boolean;
  shouldRevalidateOnDelete: (
    args: Parameters<CollectionAfterDeleteHook>[0],
  ) => Promise<boolean> | boolean;
  unstable_cache: UnstableCache;
};

export type CachedPayload = {
  count: Count;
  find: Find;
  findByID: FindByID;
  findGlobal: FindGlobal;
  findOne: FindOne;
};

export type CachedPayloadResult = {
  cachedPayloadPlugin: Plugin;
  getCachedPayload: (payload: Payload) => CachedPayload;
};
