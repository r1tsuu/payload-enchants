import type { Payload } from 'payload';

import getFileByPath from 'payload/dist/uploads/getFileByPath';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding data...');

  await payload.delete({ collection: 'users', where: {} });
  await payload.delete({ collection: 'examples', where: {} });
  await payload.delete({ collection: 'media', where: {} });
  await payload.delete({ collection: 'pages', where: {} });

  await payload.create({
    collection: 'users',
    data: {
      email: 'dev@payloadcms.com',
      password: 'test',
    },
  });

  const page = await payload.create({
    collection: 'pages',
    data: {
      title: 'Home page',
    },
  });

  const media = await payload.create({
    collection: 'media',
    data: {},
    file: await getFileByPath(__dirname + '/image.jpg'),
  });

  await payload.create({
    collection: 'examples',
    data: {
      text: 'Test text example',
      textarea: 'Some textarea also',
      richtext: [
        {
          children: [
            {
              text: 'Rich text is ',
            },
            {
              text: 'hard',
              bold: true,
            },
          ],
          type: 'h1',
        },
        {
          type: 'ul',
          children: [
            {
              children: [
                {
                  text: 'List1',
                },
              ],
              type: 'li',
            },
            {
              type: 'li',
              children: [
                {
                  text: 'List2',
                },
              ],
            },
          ],
        },
        {
          children: [
            {
              text: '',
            },
            {
              type: 'link',
              linkType: 'custom',
              url: 'https://google.com',
              newTab: true,
              children: [
                {
                  text: 'Google',
                },
              ],
            },
            {
              text: '',
            },
          ],
        },
        {
          children: [
            {
              text: '',
            },
            {
              type: 'link',
              linkType: 'internal',
              doc: {
                value: page.id,
                relationTo: 'pages',
              },
              children: [
                {
                  text: 'Home page',
                },
              ],
            },
            {
              text: '',
            },
          ],
        },
        {
          children: [
            {
              text: '',
            },
          ],
          type: 'upload',
          value: {
            id: media.id,
          },
          relationTo: 'media',
        },
        {
          children: [
            {
              text: '',
            },
          ],
        },
        {
          children: [
            {
              text: '',
            },
          ],
        },
      ],
      array: [
        {
          text: 'Text in array, could be deep nested',
        },
      ],
      blocks: [
        {
          blockType: 'block',
          text: 'Block type block',
        },
      ],
    },
    locale: 'en',
  });

  // Add additional seed data here
};
