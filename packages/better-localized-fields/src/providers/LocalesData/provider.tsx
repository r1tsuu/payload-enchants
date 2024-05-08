'use client';

import './index.scss';

import { getTranslation } from '@payloadcms/translations';
import type { Row } from '@payloadcms/ui/fields/Row';
import { useFieldProps } from '@payloadcms/ui/forms/FieldPropsProvider';
import { RenderFields } from '@payloadcms/ui/forms/RenderFields';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';
import { useLocale } from '@payloadcms/ui/providers/Locale';
import { useTranslation } from '@payloadcms/ui/providers/Translation';
import { getFormState } from '@payloadcms/ui/utilities/getFormState';
import type { FormState } from 'payload/types';
import React, { useEffect, useState } from 'react';

import { LocalesDataContext } from './context';

export const LocalesDataProvider = (props: React.ComponentProps<typeof Row>) => {
  const { fieldMap, forceRender = false } = props;

  const [localesFormState, setLocalesFormState] = useState<
    {
      formState: FormState;
      localeCode: string;
      localeLabel: string;
    }[]
  >();

  const { collectionSlug, globalSlug, id } = useDocumentInfo();

  const currentLocale = useLocale();

  const {
    localization,
    routes: { api },
    serverURL,
  } = useConfig();

  const { indexPath, path, readOnly, schemaPath, siblingPermissions } = useFieldProps();

  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchOtherLocalesData = async () => {
      if (!globalSlug && !id) return;
      if (!localization) return;

      const data = await Promise.all(
        localization.locales
          .filter(({ code }) => code !== currentLocale.code)
          .map(async (locale) => {
            const res = await fetch(
              `${serverURL}${api}/${globalSlug ? `globals/${globalSlug}` : `${collectionSlug}/${id}?locale=${locale.code}&depth=0&fallback-locale=none`}`,
              {
                credentials: 'include',
              },
            );

            const formState = await getFormState({
              apiRoute: api,
              body: {
                collectionSlug,
                data: await res.json(),
                globalSlug,
                id: id ?? undefined,
                locale: locale.code,
                schemaPath: collectionSlug || globalSlug || '',
              },
              serverURL,
            });

            return {
              formState,
              localeCode: locale.code,
              localeLabel: getTranslation(locale.label, i18n),
            };
          }),
      );

      setLocalesFormState(data);
    };

    fetchOtherLocalesData();
  }, [serverURL, api, globalSlug, collectionSlug, id, localization, currentLocale]);

  return (
    <LocalesDataContext.Provider value={{ localesFormState: localesFormState ?? [] }}>
      <div className='locales-data-provider'>
        <RenderFields
          {...{ fieldMap, forceRender, path, readOnly, schemaPath }}
          fieldMap={fieldMap}
          forceRender={forceRender}
          indexPath={indexPath}
          margins={false}
          permissions={siblingPermissions}
        />
      </div>
    </LocalesDataContext.Provider>
  );
};
