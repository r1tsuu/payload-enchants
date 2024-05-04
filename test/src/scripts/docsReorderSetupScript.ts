import { config } from 'dotenv';
import { resolve } from 'path';
import type { GeneratedTypes } from 'payload';
import { getPayload } from 'payload';
import { importConfig } from 'payload/node';

config({
  path: resolve(import.meta.dirname, './../../.env'),
});

const collections: (keyof GeneratedTypes['collections'])[] = ['docs-reoder-examples'];

const docsReorderSetupScript = async () => {
  const payload = await getPayload({
    config: importConfig('../../payload.config.ts'),
  });

  payload.logger.info('Starting...');

  const transactionId = await payload.db.beginTransaction?.();

  try {
    for (const slug of collections) {
      const { docs } = await payload.find({
        collection: slug,
        pagination: false,
        sort: '-createdAt',
      });

      const promises: Promise<unknown>[] = [];

      docs.forEach((doc, index) => {
        promises.push(
          payload.update({
            collection: slug,
            data: { docOrder: index + 1 } as any,
            id: doc.id,
          }),
        );
      });

      for (const promise of promises) {
        await promise;
      }
    }

    payload.logger.info('Success');
    if (transactionId) await payload.db.commitTransaction?.(transactionId);
  } catch (e) {
    if (e instanceof Error) payload.logger.error(e);
    payload.logger.error('Rollback script changes...');
    if (transactionId) await payload.db.rollbackTransaction?.(transactionId);
  }

  process.exit(0);
};

docsReorderSetupScript();
