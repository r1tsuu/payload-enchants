import type { PayloadRequest } from 'payload';

import type { SaveChangesArgs } from './handlers/types';

export const defaultAccess = ({ req }: { data: SaveChangesArgs; req: PayloadRequest }) => {
  return !!req.user;
};
