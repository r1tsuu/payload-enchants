import { Forbidden, type PayloadHandler } from 'payload';
import { z } from 'zod';

import type { DocsReorderOptions } from '../types';

export const schema = z.object({
  collection: z.string(),
  docs: z.array(
    z.object({
      id: z.number().or(z.string()),
      modifiedTo: z.number(),
    }),
  ),
});

export const saveChanges =
  ({ access }: { access: NonNullable<DocsReorderOptions['access']> }): PayloadHandler =>
  async (req) => {
    if (!req.json) return Response.json({ message: 'Bad Request' }, { status: 400 });

    const result = schema.safeParse(await req.json());

    if (!result.success) return Response.json({ errors: result.error.errors }, { status: 400 });

    const allowed = await access({ data: result.data, req });

    if (!allowed) throw new Forbidden();

    const {
      data: { collection, docs },
    } = result;

    const transaction = await req.payload.db.beginTransaction?.();

    if (transaction) req.transactionID = transaction;

    try {
      await Promise.all(
        docs.map((doc) => {
          req.payload.update({
            collection,
            data: {
              docOrder: doc.modifiedTo,
            },
            id: doc.id,
            req,
          });
        }),
      );

      if (transaction) await req.payload.db.commitTransaction?.(transaction);
    } catch (e) {
      if (e instanceof Error) {
        req.payload.logger.error(`An error occurred in docs-order saveChange`);
        req.payload.logger.error(e);
      }
      if (transaction) await req.payload.db.rollbackTransaction?.(transaction);
    }

    return Response.json({ success: true });
  };
