import { Forbidden } from 'payload/errors';
import type { CollectionBeforeOperationHook, Where } from 'payload/types';

import type { SanitizedOptions } from '../types';

export const beforeOperation =
  (options: SanitizedOptions): CollectionBeforeOperationHook =>
  async ({ args, collection, context, operation, req }) => {
    if (operation !== 'read' || (context.includeScheduled && args.overrideAccess !== false)) return;

    if (req.query.includeScheduled || context.includeScheduled) {
      const hasAccess = await options.scheduledAccess({ collection, operationArgs: args, req });

      if (!hasAccess) throw new Forbidden(req.t);
    }

    const where: Where = {
      and: [
        args.where ?? {},
        {
          [options.publishedAtField.name]: {
            greater_than_equal: new Date().toISOString(),
          },
        },
      ],
    };

    args.where = where;
  };
