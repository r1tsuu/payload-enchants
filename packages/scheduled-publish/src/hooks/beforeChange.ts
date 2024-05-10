import type { CollectionBeforeChangeHook } from 'payload/types';
import { deepMerge } from 'payload/utilities';

import type { SanitizedOptions } from '../types';

export const beforeChange =
  ({ ScheduledToPublishDocuments }: SanitizedOptions): CollectionBeforeChangeHook =>
  async ({ collection, data, operation, originalDoc, req }) => {
    if (operation !== 'update' || !originalDoc) return;

    const docId = originalDoc.id as number | string;

    const {
      docs: [scheduledVersion],
    } = await req.payload.find({
      collection: ScheduledToPublishDocuments.slug,
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

    if (scheduledVersion) {
      const updatedScheduledDocumnentData = {
        doc: deepMerge(scheduledVersion.doc, data),
      } as Record<string, object | string>;

      if (scheduledAt) {
        updatedScheduledDocumnentData.scheduledAt = scheduledAt;
      }

      await req.payload.update({
        collection: ScheduledToPublishDocuments.slug,
        data: updatedScheduledDocumnentData,
        id: scheduledVersion.id,
        req,
      });

      return {};
    }

    if (scheduledAt) {
      await req.payload.create({
        collection: ScheduledToPublishDocuments.slug,
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
