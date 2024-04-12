import { useAllFormFields } from '@payloadcms/ui/forms/Form';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';
import { useLocale } from '@payloadcms/ui/providers/Locale';
import { getFormState } from '@payloadcms/ui/utilities/getFormState';
import { reduceFieldsToValues } from '@payloadcms/ui/utilities/reduceFieldsToValues';
import { useCallback, useEffect, useState } from 'react';

export const useTranslator = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { collectionSlug, globalSlug, id } = useDocumentInfo();

  const {
    localization,
    routes: { api },
    serverURL,
  } = useConfig();

  const [isLoading, setIsLoading] = useState(false);

  const [activeLocaleCode, setActiveLocaleCode] = useState<string>();

  const [emptyLocales, setEmptyLocales] = useState<string[]>();

  const locale = useLocale();

  const [data, dispatch] = useAllFormFields();

  const translate = async () => {
    setIsLoading(true);
    const values = reduceFieldsToValues(data, true);

    const { translatedData } = await fetch(`${serverURL}${api}/translator/translate`, {
      body: JSON.stringify({
        collectionSlug,
        data: values,
        globalSlug,
        id,
        locale: locale.code,
        localeFrom: activeLocaleCode,
      }),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }).then((res) => res.json());

    dispatch({
      state: await getFormState({
        apiRoute: api,
        body: {
          collectionSlug,
          data: translatedData,
          globalSlug,
          locale: locale.code,
          schemaPath: collectionSlug || globalSlug || '',
        },
        serverURL,
      }),
      type: 'REPLACE_STATE',
    });

    setIsLoading(false);

    if (onSuccess) onSuccess();
  };

  const getLocalesOptions = useCallback(
    (emptyLocales: string[]) => {
      if (!localization) return [];
      if (!emptyLocales) return [];

      return localization.locales.filter(
        (each) => !emptyLocales.includes(each.code) && each.code !== locale.code,
      );
    },
    [locale.code, localization],
  );

  useEffect(() => {
    const getLocalesList = async () => {
      setIsLoading(true);

      const { emptyLocales } = await fetch(`${serverURL}${api}/translator/locales-list`, {
        body: JSON.stringify({
          collectionSlug,
          globalSlug,
          id,
          locale: locale.code,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }).then((res) => res.json());

      setEmptyLocales(emptyLocales);
      const localesOptions = getLocalesOptions(emptyLocales);

      if (localesOptions.length > 0) setActiveLocaleCode(localesOptions[0].code);

      setIsLoading(false);
    };

    getLocalesList();
  }, [collectionSlug, globalSlug, id, getLocalesOptions, api, serverURL, locale]);

  return {
    activeLocaleCode,
    isLoading,
    localesOptions: emptyLocales ? getLocalesOptions(emptyLocales) : [],
    setActiveLocaleCode,
    translate,
  };
};
