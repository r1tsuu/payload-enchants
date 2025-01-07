import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionSlug,
  GlobalAfterChangeHook,
  GlobalSlug,
  PaginatedDocs,
  Payload,
  Plugin,
  TypedCollection,
  TypedGlobal,
  Where,
} from 'payload';
import type payload from 'payload';

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

export type Populate = Record<string, Select | true>;

export type Find = <T extends CollectionSlug>(
  args: FindArgs<T>,
) => Promise<PaginatedDocs<TypedCollection[T]>>;

export type FindArgs<T extends CollectionSlug> = {
  populate?: Populate;
  populatedDocsMap?: Map<string, Record<string, any>>;
  select?: Select;
  tags?: string[];
  // eslint-disable-next-line perfectionist/sort-intersection-types
} & Omit<Parameters<Payload['find']>[0], 'collection'> & { collection: T };

export type FindOneArgs<T extends keyof TypedCollection> = {
  /** @default first field from the fields array */
  field?: string;
  populate?: Populate;
  select?: Select;
  value: string;
  // eslint-disable-next-line perfectionist/sort-intersection-types
} & Omit<Parameters<Find>[0], 'limit' | 'page' | 'pagination' | 'where'> & {
    collection: T;
  };

export type FindOne = <T extends CollectionSlug>(
  args: FindOneArgs<T>,
) => Promise<TypedCollection[T] | null>;

export type FindByID = <T extends CollectionSlug>(
  args: FindByIDArgs<T>,
) => Promise<TypedCollection[T]>;

export type FindByIDArgs<T extends CollectionSlug> = {
  populate?: Populate;
  select?: Select;
  // eslint-disable-next-line perfectionist/sort-intersection-types
} & Omit<Parameters<Payload['findByID']>[0], 'collection'> & { collection: T };

export type FindGlobal = <T extends GlobalSlug>(args: FindGlobalArgs<T>) => Promise<TypedGlobal[T]>;

export type FindGlobalArgs<T extends GlobalSlug> = {
  populate?: Populate;
  select?: Select;
  // eslint-disable-next-line perfectionist/sort-intersection-types
} & Omit<Parameters<Payload['findGlobal']>[0], 'slug'> & { slug: T };

export type Count = Payload['count'];

export type CountArgs<T extends CollectionSlug> = Parameters<typeof payload.count<T>>[0];

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
    slug: CollectionSlug;
  }>;
  extensions?: Extension[];
  globals?: Array<{
    slug: GlobalSlug;
  }>;
  loggerDebug?: boolean;
  options?: {
    buildTagFind?: (args: { slug: string }) => string;
    buildTagFindByID?: (args: { id: number | string; slug: string }) => string;
    buildTagFindGlobal?: (args: { slug: string }) => string;
    buildTagFindOne?: (args: { fieldName: string; slug: string }) => string;
    disableCache?: boolean;
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
  /**
   *  Instead of revalidating each collection document separately
   * 'simpleCache' revalidates all cached data on Payload database update
   *  */
  useSimpleCacheStrategy?: boolean;
};

export type SanitizedArgsContext = {
  SIMPLE_CACHE_TAG: string;
  buildTagFind: (args: { slug: string }) => string;
  buildTagFindByID: (args: { id: number | string; slug: string }) => string;
  buildTagFindGlobal: (args: { slug: string }) => string;
  buildTagFindOne: (args: { fieldName: string; slug: string; value: unknown }) => string;
  collections: Array<{ findOneFields: Required<FindOneFieldConfig>[]; slug: string }>;
  debugLog: (args: { message: string; payload: Payload }) => void;
  disableCache: boolean;
  globals: Array<{ slug: string }>;
  revalidate?: number;
  revalidateSimpleTag: (payload: Payload) => void;
  revalidateTag: (tag: string) => void;
  revalidateTags: (args: {
    operation: 'CREATE' | 'DELETE' | 'DELETE-BULK' | 'SIMPLE-TAG' | 'UPDATE' | 'UPDATE-BULK';
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
  useSimpleCacheStrategy: boolean;
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
