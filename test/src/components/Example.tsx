import configPromise from '@payload-config';
import { getPayload } from 'payload';
import React from 'react';

const Example: React.FC = async () => {
  const payload = await getPayload({ config: configPromise });

  const url = payload.getAdminURL();

  return <div>The admin panel is running at: {url}</div>;
};

export default Example;
