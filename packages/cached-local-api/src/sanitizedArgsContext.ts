import type { Args, FindOneFieldConfig, SanitizedArgsContext } from './types';

const defaultBuildTagFind: SanitizedArgsContext['buildTagFind'] = ({ slug }) => `${slug}-find`;

const defaultBuildTagFindGlobal: SanitizedArgsContext['buildTagFindGlobal'] = ({ slug }) =>
  `global-${slug}-find`;

const defaultBuildTagFindByID: SanitizedArgsContext['buildTagFindByID'] = ({ id, slug }) =>
  `${slug}-${id}-find-by-id`;

const defaultBuildTagFindOne: SanitizedArgsContext['buildTagFindOne'] = ({
  fieldName,
  slug,
  value,
}) => `${slug}-${fieldName}-${JSON.stringify(value)}`;

const defaultBuildWhere: NonNullable<FindOneFieldConfig['buildWhere']> = ({
  fieldName,
  value,
}) => ({
  [fieldName]: {
    equals: value,
  },
});

const defaultGetFieldFromDoc: (
  fieldName: string,
) => NonNullable<FindOneFieldConfig['getFieldFromDoc']> = (fieldName) => (doc) => doc[fieldName];

const should = () => true;

export const sanitizedArgsContext = (args: Args): SanitizedArgsContext => {
  return {
    ...args,
    SIMPLE_CACHE_TAG: 'simple-cache-tag',
    buildTagFind: args.options?.buildTagFind ?? defaultBuildTagFind,
    buildTagFindByID: args.options?.buildTagFindByID ?? defaultBuildTagFindByID,
    buildTagFindGlobal: args.options?.buildTagFindGlobal ?? defaultBuildTagFindGlobal,
    buildTagFindOne: args.options?.buildTagFindOne ?? defaultBuildTagFindOne,
    collections: (args.collections ?? []).map((each) => {
      return {
        findOneFields: (each.findOneFields ?? []).map((each) => {
          if (typeof each === 'object')
            return {
              buildWhere: each.buildWhere ?? defaultBuildWhere,
              getFieldFromDoc: each.getFieldFromDoc ?? defaultGetFieldFromDoc(each.name),
              name: each.name,
            };

          return {
            buildWhere: defaultBuildWhere,
            getFieldFromDoc: defaultGetFieldFromDoc(each),
            name: each,
          };
        }),
        slug: each.slug.toString(),
      };
    }),
    debugLog: ({ message, payload }) => {
      if (!args.loggerDebug) return;

      payload.logger.info(`[Cached Local API] - ${message}`);
    },
    disableCache: args.options?.disableCache ?? false,
    globals: (args.globals ?? []).map((each) => {
      return {
        slug: each.slug.toString(),
      };
    }),
    revalidateSimpleTag: function (payload) {
      this.revalidateTag(this.SIMPLE_CACHE_TAG);
      this.debugLog({ message: `Cache Revalidated`, payload });
    },
    revalidateTags: function ({ operation, payload, tags }) {
      tags.forEach((tag) => {
        this.revalidateTag(tag);
        this.debugLog({ message: `Revalidated tag - ${tag}, Operation - ${operation}`, payload });
      });
    },
    shouldCacheCountOperation: args.options?.shouldCacheCountOperation ?? should,
    shouldCacheFindByIDOperation: args.options?.shouldCacheFindByIDOperation ?? should,
    shouldCacheFindGlobalOperation: args.options?.shouldCacheFindGlobalOperation ?? should,
    shouldCacheFindOneOperation: args.options?.shouldCacheFindOneOperation ?? should,
    shouldCacheFindOperation: args.options?.shouldCacheFindOperation ?? should,
    shouldRevalidateGlobalOnChange: args.options?.shouldRevalidateGlobalOnChange ?? should,
    shouldRevalidateOnChange: args.options?.shouldRevalidateOnChange ?? should,
    shouldRevalidateOnDelete: args.options?.shouldRevalidateOnDelete ?? should,
    useSimpleCacheStrategy: args.useSimpleCacheStrategy ?? false,
  };
};
