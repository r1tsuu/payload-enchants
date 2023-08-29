import { buildConfig } from 'payload/config';
import path from 'path';
import Users from './collections/Users';
import Examples from './collections/Examples';
import { samplePlugin } from '../../src/index'

export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: Users.slug,
    webpack: config => {
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
      }
      return newConfig
    },
  },
  collections: [
    Examples, Users,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    samplePlugin({
      enabled: true,
    })
  ],
})
