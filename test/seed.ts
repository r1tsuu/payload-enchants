import type { Payload } from 'payload';

import { lexicalRich } from './seedLexical';
import { slateRich } from './seedSlate';

export const seed = ({ isLexical, payload }: { isLexical: boolean; payload: Payload }) => {
  return Promise.all([
    payload.create({
      collection: 'small-posts',
      data: {
        title: 'Hello world this is a title',
      },
    }),
    payload.create({
      collection: 'posts',
      data: {
        array: [
          {
            titleLocalized: "Hello World i'm localized in the array",
          },
        ],
        arrayLocalized: [
          {
            title: "Hello world i'm in the localized array",
          },
        ],
        blocks: [
          {
            blockType: 'first',
            title: "Hello all! I'm localized in the block",
          },
        ],
        checkbox: true,
        someRich: isLexical ? (lexicalRich as any) : (slateRich as any),
        title: "Hello world, it's localized text!",
      },
    }),
  ]);
};
