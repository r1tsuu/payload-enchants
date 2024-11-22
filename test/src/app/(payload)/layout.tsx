/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import React from 'react';
import configPromise from '@payload-config';
import { RootLayout } from '@payloadcms/next/layouts';

import '@payloadcms/next/css';
import './custom.scss';
import { importMap } from './admin/importMap';

type Args = {
  children: React.ReactNode;
};

const Layout = ({ children }: Args) => (
  <RootLayout importMap={importMap} config={configPromise}>
    {children}
  </RootLayout>
);

export default Layout;
