import { withPayload } from '@payloadcms/next/withPayload';
// import { resolve } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  experimental: {
    reactCompiler: true,
  },
  // transpilePackages: [resolve(import.meta.dirname, '../packages/docs-reorder')],
  reactStrictMode: false,
};

export default withPayload(nextConfig);
