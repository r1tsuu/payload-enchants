'use client';

import { useAllFormFields } from '@payloadcms/ui/forms/Form';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';
import { reduceFieldsToValues } from '@payloadcms/ui/utilities/reduceFieldsToValues';
import { useEffect, useRef } from 'react';

export const InjectCustomUseAsTitle = () => {
  const [fields] = useAllFormFields();

  const { collectionSlug } = useDocumentInfo();

  const {
    routes: { api },
    serverURL,
  } = useConfig();

  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeout.current = setTimeout(() => {
      fetch(`${serverURL}${api}/${collectionSlug}/use-as-title`, {
        body: JSON.stringify(reduceFieldsToValues(fields, true)),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }).then(async (response) => {
        const { useAsTitle } = await response.json();

        const titleElement = document.querySelector('.doc-header__title.render-title');

        titleElement.setAttribute('title', useAsTitle);
        titleElement.innerHTML = useAsTitle;
      });
    }, 150);

    return () => clearTimeout(timeout.current);
  }, [fields, serverURL, api, collectionSlug]);

  return null;
};
