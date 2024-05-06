import type { ScheduledAccess } from './types';

export const scheduledAccess: ScheduledAccess = ({ req }) => {
  return req.user?.collection === req.payload.config.admin.user;
};
