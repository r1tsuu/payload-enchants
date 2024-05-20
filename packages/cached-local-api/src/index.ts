import type { Payload } from 'payload';

import { buildCount } from './operations/count';
import { buildFind } from './operations/find';
import { buildFindByID } from './operations/findByID';
import { buildFindGlobal } from './operations/findGlobal';
import { buildFindOne } from './operations/findOne';
import { buildPlugin } from './plugin';
import { sanitizedArgsContext } from './sanitizedArgsContext';
import type { Args, CachedPayload, CachedPayloadResult } from './types';

export { CachedPayload };

export const buildCachedPayload = (args: Args): CachedPayloadResult => {
  const ctx = sanitizedArgsContext(args);

  const plugin = buildPlugin(ctx);

  const getCachedPayload = function (payload: Payload): CachedPayload {
    const findByID = buildFindByID({ ctx, payload });

    const find = buildFind({
      ctx,
      findByID,
      payload,
    });

    const findGlobal = buildFindGlobal({
      ctx,
      findByID,
      payload,
    });

    const findOne = buildFindOne({ ctx, findByID, payload });

    const count = buildCount({
      ctx,
      payload,
    });

    return {
      count,
      find,
      findByID,
      findGlobal,
      findOne,
    };
  };

  return {
    cachedPayloadPlugin: plugin,
    getCachedPayload,
  };
};
