import type { GeneratedTypes, Payload } from 'payload';
import type { Plugin } from 'payload/config';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
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

export type Find = Payload['find'];

export type FindArgs = Parameters<Find>[0];

export type FindByID = Payload['findByID'];

export type FindByIDArgs = Parameters<FindByID>[0];

export type FindGlobal = Payload['findGlobal'];

export type FindGlobalArgs = Parameters<FindGlobal>[0];

export type Count = Payload['count'];

export type CountArgs = Parameters<Count>[0];

export type Args = {
  collections?: Array<{ slug: keyof GeneratedTypes['collections'] }>;
  globals?: Array<{
    slug: keyof GeneratedTypes['globals'];
  }>;
  options?: {
    buildTagFind?: (args: { slug: string }) => string;
    buildTagFindByID?: (args: { id: number | string; slug: string }) => string;
    buildTagFindGlobal?: (args: { slug: string }) => string;
    shouldCacheCountOperation?: (args: CountArgs) => Promise<boolean> | boolean;
    shouldCacheFindByIDOperation?: (args: FindByIDArgs) => Promise<boolean> | boolean;
    shouldCacheFindGlobalOperation?: (args: FindGlobalArgs) => Promise<boolean> | boolean;
    shouldCacheFindOperation?: (args: FindArgs) => Promise<boolean> | boolean;
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
  collections: Array<{ slug: string }>;
  globals: Array<{ slug: string }>;
  revalidateTag: (tag: string) => void;
  shouldCacheCountOperation: (args: CountArgs) => Promise<boolean> | boolean;
  shouldCacheFindByIDOperation: (args: FindByIDArgs) => Promise<boolean> | boolean;
  shouldCacheFindGlobalOperation: (args: FindGlobalArgs) => Promise<boolean> | boolean;
  shouldCacheFindOperation: (args: FindArgs) => Promise<boolean> | boolean;
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
};

export type CachedPayloadResult = {
  cachedPayloadPlugin: Plugin;
  getCachedPayload: (payload: Payload) => CachedPayload;
};
