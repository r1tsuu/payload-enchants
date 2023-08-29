import { buildConfig } from 'payload/config';
import path from 'path';
import Users from './collections/Users';
import Examples from './collections/Examples';
import { translatorPlugin } from '../../src';
import Pages from './collections/Pages';
import Media from './collections/Media';

export default buildConfig({
  serverURL: 'http://localhost:3000',
  i18n: {
    lng: 'en',
  },
  localization: {
    locales: ['en', 'de', 'fr', 'jp'],
    defaultLocale: 'en',
  },
  admin: {
    user: Users.slug,
    webpack: (config) => {
      const newConfig = {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...(config?.resolve?.alias || {}),
            react: path.join(__dirname, '../node_modules/react'),
            'react-dom': path.join(__dirname, '../node_modules/react-dom'),
            payload: path.join(__dirname, '../node_modules/payload'),
          },
        },
      };
      return newConfig;
    },
  },
  collections: [Pages, Media, Users, Examples],
  globals: [],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    translatorPlugin({
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      collections: ['examples'],
    }),
  ],
});
