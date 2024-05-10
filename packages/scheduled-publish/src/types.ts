import type {
  CollectionConfig,
  DateField,
  Payload,
  PayloadRequestWithData,
  RelationshipField,
  SanitizedCollectionConfig,
} from 'payload/types';

export type ScheduledAccess = ({
  collection,
  req,
}: {
  collection: SanitizedCollectionConfig;
  operationArgs?: Parameters<Payload['find']>[0] | Parameters<Payload['findByID']>[0];
  req: PayloadRequestWithData;
}) => Promise<boolean | undefined> | boolean | undefined;

export type ScheduledPublishOptions = {
  collections: string[];
  disabled?: boolean;
  publishedAtField?: Partial<DateField>;
  scheduledAccess?: ScheduledAccess;
};

export type SanitizedOptions = {
  ScheduledToPublishDocuments: CollectionConfig;
  collections: string[];
  scheduledAccess: ScheduledAccess;
};
