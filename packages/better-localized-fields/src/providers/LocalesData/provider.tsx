'use client';

import './index.scss';

import { getTranslation } from '@payloadcms/translations';
import {
  RenderFields,
  useConfig,
  useDocumentInfo,
  useFieldProps,
  useLocale,
  useTranslation,
} from '@payloadcms/ui';
import { getFormState } from '@payloadcms/ui/shared';
import type { FormState, RowLabelComponent } from 'payload';
import type { ComponentProps } from 'react';
import React, { useEffect, useState } from 'react';

import { LocalesDataContext } from './context';

export const LocalesDataProvider = (props: ComponentProps<RowLabelComponent>) => {
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
