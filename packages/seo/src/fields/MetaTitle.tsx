'use client';

import './index.scss';

import type { FormFieldBase } from '@payloadcms/ui/fields/shared';
import { TextInput } from '@payloadcms/ui/fields/Text';
import { FieldLabel } from '@payloadcms/ui/forms/FieldLabel';
import { useFieldProps } from '@payloadcms/ui/forms/FieldPropsProvider';
import { useAllFormFields } from '@payloadcms/ui/forms/Form';
import type { FieldType, Options } from '@payloadcms/ui/forms/useField';
import { useField } from '@payloadcms/ui/forms/useField';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';
import { useLocale } from '@payloadcms/ui/providers/Locale';
import { useTranslation } from '@payloadcms/ui/providers/Translation';
import React, { useCallback } from 'react';

import { defaults } from '../defaults';
import type { GenerateTitle } from '../types';
import { LengthIndicator } from '../ui/LengthIndicator';

const { maxLength, minLength } = defaults.title;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type MetaTitleProps = {
  hasGenerateTitleAi: boolean;
  hasGenerateTitleFn: boolean;
} & FormFieldBase;

export const MetaTitle: React.FC<MetaTitleProps> = (props) => {
  const { CustomLabel, hasGenerateTitleAi, hasGenerateTitleFn, labelProps, path, required } =
    props || {};

  const { path: pathFromContext } = useFieldProps();

  const { t } = useTranslation();

  const field: FieldType<string> = useField({
    path,
  } as Options);

  const locale = useLocale();

  const [fields] = useAllFormFields();

  const docInfo = useDocumentInfo();

  const { errorMessage, setValue, showError, value } = field;

  const regenerateTitle = useCallback(async () => {
    if (!hasGenerateTitleFn) return;

    const genTitleResponse = await fetch('/api/plugin-seo/generate-title', {
      body: JSON.stringify({
        ...docInfo,
        doc: { ...fields },
        locale: typeof locale === 'object' ? locale?.code : locale,
      } satisfies Parameters<GenerateTitle>[0]),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const { result: generatedTitle } = await genTitleResponse.json();

    setValue(generatedTitle || '');
  }, [fields, setValue, hasGenerateTitleFn, locale, docInfo]);

  const regenerateTitleAi = useCallback(async () => {
    if (!hasGenerateTitleAi) return;

    const genTitleResponse = await fetch('/api/plugin-seo/generate-title-ai', {
      body: JSON.stringify({
        ...docInfo,
        doc: { ...fields },
        locale: typeof locale === 'object' ? locale?.code : locale,
      } satisfies Parameters<GenerateTitle>[0]),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const { result: generatedTitle } = await genTitleResponse.json();

    setValue(generatedTitle || '');
  }, [fields, setValue, hasGenerateTitleAi, locale, docInfo]);

  return (
    <div
      style={{
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          marginBottom: '5px',
          position: 'relative',
        }}
      >
        <div className='plugin-seo__field'>
          <FieldLabel CustomLabel={CustomLabel} {...(labelProps || {})} />
          {hasGenerateTitleFn && (
            <React.Fragment>
              &nbsp; &mdash; &nbsp;
              <button
                onClick={regenerateTitle}
                style={{
                  background: 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'currentcolor',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                type='button'
              >
                {t('plugin-seo:autoGenerate')}
              </button>
            </React.Fragment>
          )}
          {hasGenerateTitleAi && (
            <React.Fragment>
              &nbsp; &mdash; &nbsp;
              <button
                onClick={regenerateTitleAi}
                style={{
                  background: 'none',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'currentcolor',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
                type='button'
              >
                {t('plugin-seo:generateAi')}
              </button>
            </React.Fragment>
          )}
        </div>
        <div
          style={{
            color: '#9A9A9A',
          }}
        >
          {t('plugin-seo:lengthTipTitle', { maxLength, minLength })}
          <a
            href='https://developers.google.com/search/docs/advanced/appearance/title-link#page-titles'
            rel='noopener noreferrer'
            target='_blank'
          >
            {t('plugin-seo:bestPractices')}
          </a>
          .
        </div>
      </div>
      <div
        style={{
          marginBottom: '10px',
          position: 'relative',
        }}
      >
        <TextInput
          CustomError={errorMessage}
          onChange={setValue}
          path={pathFromContext}
          required={required}
          showError={showError}
          style={{
            marginBottom: 0,
          }}
          value={value}
        />
      </div>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          width: '100%',
        }}
      >
        <LengthIndicator maxLength={maxLength} minLength={minLength} text={value} />
      </div>
    </div>
  );
};
