import { Forbidden } from 'payload/errors';
import type { CollectionBeforeOperationHook, Where } from 'payload/types';

import type { SanitizedOptions } from '../types';

/** Handle access for findMany */
export const beforeOperation =
  ({ scheduledAccess }: SanitizedOptions): CollectionBeforeOperationHook =>
  async ({ args, collection, operation, req }) => {
    if (operation !== 'read' || (args.draft && args.overrideAccess !== false)) return;

    if (args.draft) {
      const hasAccess = await scheduledAccess({ collection, operationArgs: args, req });

      if (!hasAccess) throw new Forbidden(req.t);
    } else {
      const where: Where = {
        and: [
          args.where ?? {},
          {
            scheduledAt: {
              less_than_equal: new Date().toISOString(),
            },
          },
        ],
      };

      args.where = where;
    }
  };
