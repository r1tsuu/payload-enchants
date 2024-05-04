import { config } from 'dotenv';
import { resolve } from 'path';
import type { GeneratedTypes } from 'payload';
import { getPayload } from 'payload';
import { importConfig } from 'payload/node';
import type { PayloadRequest } from 'payload/types';

config({
  path: resolve(import.meta.dirname, './../../.env'),
});

const collections: (keyof GeneratedTypes['collections'])[] = ['docs-reoder-examples'];

const docsReorderSetupScript = async () => {
  const payload = await getPayload({
    config: importConfig('../../payload.config.ts'),
  });

  payload.logger.info('Starting...');

  const req = {} as PayloadRequest;

  const transactionId = await payload.db.beginTransaction?.();

  if (transactionId !== null) req.transactionID = transactionId;

  try {
    for (const slug of collections) {
      const { docs } = await payload.find({
        collection: slug,
        pagination: false,
        req,
        sort: '-createdAt',
      });

      const promises: Promise<unknown>[] = [];

      docs.forEach((doc, index) => {
        promises.push(
          payload.update({
            collection: slug,
            data: { docOrder: index + 1 } as any,
            id: doc.id,
            req,
          }),
        );
      });

      for (const promise of promises) {
        await promise;
      }
    }

    payload.logger.info('Success');
    if (req.transactionID) await payload.db.commitTransaction?.(req.transactionID);
  } catch (e) {
    if (e instanceof Error) payload.logger.error(e);
    payload.logger.error('Rollback script changes...');
    if (req.transactionID) await payload.db.rollbackTransaction?.(req.transactionID);
  }

  process.exit(0);
};

docsReorderSetupScript();
