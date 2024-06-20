import type { GlobalConfig } from 'payload/types';

import type { SanitizedArgsContext } from '../types';

export const extendGlobalConfig = ({
  ctx,
  global,
}: {
  ctx: SanitizedArgsContext;
  global: GlobalConfig;
}): GlobalConfig => {
  const { slug } = global;

  return {
    ...global,
    hooks: {
      ...(global.hooks ?? {}),
      afterChange: [
        ...(global.hooks?.afterChange ?? []),
        async (hookArgs) => {
          const shouldValidate = await ctx.shouldRevalidateGlobalOnChange(hookArgs);

          if (!shouldValidate) return;

          if (ctx.useSimpleCacheStrategy) {
            ctx.revalidateSimpleTag(hookArgs.req.payload);

            return;
          }

          ctx.revalidateTags({
            operation: 'UPDATE',
            payload: hookArgs.req.payload,
            tags: [ctx.buildTagFindGlobal({ slug })],
          });
        },
      ],
    },
  };
};
