import { useConfig } from '@payloadcms/ui/providers/Config';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';
import type { ReactNode } from 'react';

import { createClient } from '../../api';
import { TranslatorContext } from './context';

export const TranslatorProvider = ({ children }: { children: ReactNode }) => {
  const { collectionSlug, globalSlug, id } = useDocumentInfo();

  const {
    localization,
    routes: { api },
    serverURL,
  } = useConfig();

  const api = createClient({ api, serverURL });
};
