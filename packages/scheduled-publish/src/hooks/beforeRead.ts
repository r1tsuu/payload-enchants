import { Forbidden } from 'payload/errors';
import type { CollectionBeforeReadHook } from 'payload/types';

import type { SanitizedOptions } from '../types';

/** Handle access for findOne */
export const beforeRead =
  ({ scheduledAccess }: SanitizedOptions): CollectionBeforeReadHook =>
  async ({ collection, context, doc, req }) => {
    if (context.includeScheduled) return;

    if (req.query.includeScheduled || context.includeScheduled) {
      const hasAccess = await scheduledAccess({ collection, req });

      if (!hasAccess) throw new Forbidden(req.t);
    }

    // if (new Date(doc.scheduledAt) > new Date()) throw new Forbidden(req.t);
  };
