import configPromise from '@payload-config';
import { getPayloadHMR } from '@payloadcms/next/utilities';

import { getCachedPayload } from '../../../cached-local-api';

const Page = async () => {
  const payload = await getPayloadHMR({
    config: configPromise,
  });

  const cachedPayload = getCachedPayload(payload);

  const posts = await cachedPayload.find({ collection: 'posts' });

  return (
    <div>
      {posts.docs.map((each) => (
        <div key={each.id}>{each.title}</div>
      ))}
    </div>
  );
};

export default Page;
