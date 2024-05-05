import type { Payload } from 'payload';

// thanks chatgprt
const randomWords = [
  'Elephant',
  'Sunshine',
  'Galaxy',
  'Bicycle',
  'Dragon',
  'Adventure',
  'Symphony',
  'Pineapple',
  'Wanderlust',
  'Moonlight',
  'Chocolate',
  'Serendipity',
  'Thunderstorm',
  'Velvet',
  'Kaleidoscope',
  'Bubblegum',
  'Enigma',
  'Waterfall',
  'Firefly',
  'Rainbow',
  'Cobweb',
  'Whirlwind',
  'Marshmallow',
  'Stardust',
  'Tornado',
  'Meadow',
  'Mirage',
  'Saffron',
  'Zephyr',
  'Blizzard',
];

export const seedDocsReorderExamples = async (payload: Payload) => {
  const examples = await payload.count({ collection: 'docs-reoder-examples' });

  if (!examples.totalDocs) return;
  payload.logger.info('Seeding examples...');
  for (const title of randomWords) {
    await payload.create({ collection: 'docs-reoder-examples', data: { title } });
  }
};
