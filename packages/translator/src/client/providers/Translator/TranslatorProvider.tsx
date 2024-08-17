import {
  toast,
  useAllFormFields,
  useConfig,
  useDocumentInfo,
  useForm,
  useLocale,
  useModal,
  useTranslation,
} from '@payloadcms/ui';
import { getFormState } from '@payloadcms/ui/shared';
import { reduceFieldsToValues } from 'payload/shared';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

import type { TranslateResolver } from '../../../resolvers/types';
import type { TranslateArgs } from '../../../translate/types';
import { createClient } from '../../api';
import { TranslatorContext } from './context';

const modalSlug = 'translator-modal';

export const TranslatorProvider = ({ children }: { children: ReactNode }) => {
  const [resolver, setResolver] = useState<null | string>(null);

  const [data, dispatch] = useAllFormFields();

  const { collectionSlug, globalSlug, id } = useDocumentInfo();

  const { setModified } = useForm();

  const modal = useModal();

  const { t } = useTranslation();

  const resolverT = (
    key:
      | 'buttonLabel'
      | 'errorMessage'
      | 'modalTitle'
      | 'submitButtonLabelEmpty'
      | 'submitButtonLabelFull'
      | 'successMessage',
  ) => {
    if (!resolver) return '';

    return t(`plugin-translator:resolver_${resolver}_${key}` as Parameters<typeof t>[0]);
  };

  const locale = useLocale();

  const {
    config: {
      admin: { custom },
      localization,
      routes: { api },
      serverURL,
    },
  } = useConfig();

  const apiClient = createClient({ api, serverURL });

  const resolverConfig = useMemo(() => {
    if (!resolver) return null;

    const resolvers = (custom?.translator?.resolvers as TranslateResolver[]) || undefined;

    if (!resolvers) return null;

    const resolverConfig = resolvers.find((each) => each.key === resolver);

    return resolverConfig ?? null;
  }, [custom, resolver]);

  if (!localization)
    throw new Error('Localization config is not provided and PluginTranslator is used');

  const localesOptions = localization.locales.filter((each) => each.code !== locale.code);

  const [localeToTranslateFrom, setLocaleToTranslateFrom] = useState<string>('');

  useEffect(() => {
    const defaultFromOptions = localesOptions.find(
      (each) => localization.defaultLocale === each.code,
    );

    if (defaultFromOptions) setLocaleToTranslateFrom(defaultFromOptions.code);
    setLocaleToTranslateFrom(localesOptions[0].code);
  }, [locale]);

  const closeTranslator = () => modal.closeModal(modalSlug);

  const submit = async ({ emptyOnly }: { emptyOnly: boolean }) => {
    if (!resolver) return;

    const args: TranslateArgs = {
      collectionSlug,
      data: reduceFieldsToValues(data, true),
      emptyOnly,
      globalSlug,
      id: id === null ? undefined : id,
      locale: locale.code,
      localeFrom: localeToTranslateFrom,
      resolver,
    };

    const result = await apiClient.translate(args);

    if (!result.success) {
      toast.error(resolverT('errorMessage'));

      return;
    }

    dispatch({
      state: await getFormState({
        apiRoute: api,
        body: {
          collectionSlug,
          data: result.translatedData,
          globalSlug,
          locale: locale.code,
          schemaPath: collectionSlug || globalSlug || '',
        },
        serverURL,
      }),
      type: 'REPLACE_STATE',
    });

    if (resolverConfig) {
      setModified(true);
      toast.success(resolverT('successMessage'));
    }
    closeTranslator();
  };

  return (
    <TranslatorContext.Provider
      value={{
        closeTranslator,
        localeToTranslateFrom,
        localesOptions,
        modalSlug,
        openTranslator: ({ resolverKey }) => {
          setResolver(resolverKey);
          modal.openModal(modalSlug);
        },
        resolver: resolverConfig,
        resolverT,
        setLocaleToTranslateFrom,
        submit,
      }}
    >
      {children}
    </TranslatorContext.Provider>
  );
};
