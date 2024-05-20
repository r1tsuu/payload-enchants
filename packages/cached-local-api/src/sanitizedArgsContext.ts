import type { Args, SanitizedArgsContext } from './types';

const defaultBuildTagFind: SanitizedArgsContext['buildTagFind'] = ({ slug }) => `${slug}-find`;

const defaultBuildTagFindGlobal: SanitizedArgsContext['buildTagFindGlobal'] = ({ slug }) =>
  `global-${slug}-find`;

const defaultBuildTagFindByID: SanitizedArgsContext['buildTagFindByID'] = ({ id, slug }) =>
  `${slug}-${id}-find-by-id`;

const should = () => true;

export const sanitizedArgsContext = (args: Args): SanitizedArgsContext => {
  return {
    ...args,
    buildTagFind: args.options?.buildTagFind ?? defaultBuildTagFind,
    buildTagFindByID: args.options?.buildTagFindByID ?? defaultBuildTagFindByID,
    buildTagFindGlobal: args.options?.buildTagFindGlobal ?? defaultBuildTagFindGlobal,
    collections: (args.collections ?? []).map((each) => {
      return {
        slug: each.slug.toString(),
      };
    }),
    globals: (args.globals ?? []).map((each) => {
      return {
        slug: each.slug.toString(),
      };
    }),
    shouldCacheCountOperation: args.options?.shouldCacheCountOperation ?? should,
    shouldCacheFindByIDOperation: args.options?.shouldCacheFindByIDOperation ?? should,
    shouldCacheFindGlobalOperation: args.options?.shouldCacheFindGlobalOperation ?? should,
    shouldCacheFindOperation: args.options?.shouldCacheFindOperation ?? should,
    shouldRevalidateGlobalOnChange: args.options?.shouldRevalidateGlobalOnChange ?? should,
    shouldRevalidateOnChange: args.options?.shouldRevalidateOnChange ?? should,
    shouldRevalidateOnDelete: args.options?.shouldRevalidateOnDelete ?? should,
  };
};
