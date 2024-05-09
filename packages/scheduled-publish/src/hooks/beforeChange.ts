import type { CollectionBeforeChangeHook } from 'payload/types';
import { deepMerge } from 'payload/utilities';

import type { SanitizedOptions } from '../types';

export const beforeChange =
  (options: SanitizedOptions): CollectionBeforeChangeHook =>
  async ({ collection, data, operation, originalDoc, req }) => {
    if (operation !== 'update' || !originalDoc) return;

    const docId = originalDoc.id as number | string;

    const {
      docs: [lastScheduledVersion],
    } = await req.payload.find({
      collection: options.ScheduledToPublishDocuments.slug,
      limit: 1,
      req,
      where: {
        and: [
          {
            isPublished: {
              equals: false,
            },
          },
          {
            parent: {
              equals: {
                relationTo: collection.slug,
                value: docId,
              },
            },
          },
        ],
      },
    });

    const scheduledAt = data.scheduledAt as string | undefined;

    delete data.scheduledAt;

    if (lastScheduledVersion) {
      const updatedScheduledDocumnentData = {
        doc: deepMerge(lastScheduledVersion.doc, data),
      } as Record<string, object | string>;

      if (scheduledAt) {
        updatedScheduledDocumnentData.scheduledAt = scheduledAt;
      }

      await req.payload.update({
        collection: options.ScheduledToPublishDocuments.slug,
        data: updatedScheduledDocumnentData,
        id: lastScheduledVersion.id,
        req,
      });

      return {};
    }

    if (scheduledAt) {
      await req.payload.create({
        collection: options.ScheduledToPublishDocuments.slug,
        data: {
          doc: deepMerge(originalDoc, data),
          isPublished: false,
          parent: {
            relationTo: collection.slug,
            value: docId,
          },
          scheduledAt,
        },
        req,
      });

      return {};
    }
  };
