import { withPayload } from '@payloadcms/next/withPayload';
// import { resolve } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  // transpilePackages: [resolve(import.meta.dirname, '../packages/docs-reorder')],
};

export default withPayload(nextConfig);
