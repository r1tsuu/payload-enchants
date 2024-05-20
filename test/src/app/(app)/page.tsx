import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';

import { getCachedPayload } from '../../../cached-local-api';

const Page = async () => {
  const payload = await getPayloadHMR({
    config: configPromise,
  });

  const cachedPayload = getCachedPayload(payload);

  const posts = await cachedPayload.find({ collection: 'posts' });

  const postBySlug = await cachedPayload.findOne({ collection: 'posts', value: 'home' });

  // In this case it's not required as `slug` field is the first item in `findOneFields` array.
  const postBySlugExplict = await cachedPayload.findOne({
    collection: 'posts',
    field: 'slug',
    value: 'home',
  });

  // by id
  if (postBySlug) {
    const postByID = await cachedPayload.findByID({
      collection: 'posts',
      id: postBySlug?.id ?? '',
    });
  }

  // count
  const { totalDocs } = await cachedPayload.count({ collection: 'posts' });

  return (
    <div>
      {posts.docs.map((each) => (
        <div key={each.id}>{each.title}</div>
      ))}
    </div>
  );
};

export default Page;
