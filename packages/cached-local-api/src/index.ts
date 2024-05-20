import type { Payload } from 'payload';

import { buildFind } from './operations/find';
import { buildFindByID } from './operations/findByID';
import { buildFindGlobal } from './operations/findGlobal';
import { buildPlugin } from './plugin';
import { sanitizedArgsContext } from './sanitizedArgsContext';
import type { Args, CachedPayload, CachedPayloadResult } from './types';

export { CachedPayload };

export const buildCachedPayload = (args: Args): CachedPayloadResult => {
  const ctx = sanitizedArgsContext(args);

  const plugin = buildPlugin(ctx);

  const getCachedPayload = function (payload: Payload): CachedPayload {
    const findByID = buildFindByID({ ctx, payload });

    const find = buildFind({ ctx, findByID, payload });

    const findGlobal = buildFindGlobal({ ctx, findByID, payload });

    return {
      find,
      findByID,
      findGlobal,
    };
  };

  return {
    cachedPayloadPlugin: plugin,
    getCachedPayload,
  };
};
