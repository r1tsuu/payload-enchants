'use client';

import type { UploadInputProps } from '@payloadcms/ui/fields/Upload';
import { UploadInput } from '@payloadcms/ui/fields/Upload';
import { FieldLabel } from '@payloadcms/ui/forms/FieldLabel';
import { useFieldProps } from '@payloadcms/ui/forms/FieldPropsProvider';
import { useAllFormFields } from '@payloadcms/ui/forms/Form';
import { useField } from '@payloadcms/ui/forms/useField';
import { withCondition } from '@payloadcms/ui/forms/withCondition';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';
import { useLocale } from '@payloadcms/ui/providers/Locale';
import { useTranslation } from '@payloadcms/ui/providers/Translation';
import React, { useCallback } from 'react';

import type { GenerateImage } from '../types';
import { Pill } from '../ui/Pill';

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type MetaImageProps = {
  hasGenerateImageFn: boolean;
} & UploadInputProps;

const _MetaImage: React.FC<MetaImageProps> = (props) => {
  const {
    CustomDescription,
    CustomError,
    CustomLabel,
    className,
    descriptionProps,
    errorProps,
    hasGenerateImageFn,
    label,
    labelProps,
    path: pathFromProps,
    readOnly: readOnlyFromProps,
    relationTo,
    required,
    style,
    validate,
    width,
  } = props || {};

  const { path: pathFromContext, readOnly: readOnlyFromContext } = useFieldProps();

  const readOnly = readOnlyFromProps || readOnlyFromContext;

  const memoizedValidate = useCallback(
    (value, options) => {
      if (typeof validate === 'function') {
        return validate(value, { ...options, required });
      }
    },
    [validate, required],
  );

  const { filterOptions, path, setValue, showError, value } = useField<string>({
    path: pathFromContext || pathFromProps,
    validate: memoizedValidate,
  });

  const { t } = useTranslation();

  const locale = useLocale();

  const [fields] = useAllFormFields();

  const docInfo = useDocumentInfo();

  const onChange = useCallback(
    (incomingImage) => {
      if (incomingImage !== null) {
        const { id: incomingID } = incomingImage;

        setValue(incomingID);
      } else {
        setValue(null);
      }
    },
    [setValue],
  );

  const regenerateImage = useCallback(async () => {
    if (!hasGenerateImageFn) return;

    const genImageResponse = await fetch('/api/plugin-seo/generate-image', {
      body: JSON.stringify({
        ...docInfo,
        doc: { ...fields },
        locale: typeof locale === 'object' ? locale?.code : locale,
      } satisfies Parameters<GenerateImage>[0]),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const { result: generatedImage } = await genImageResponse.json();

    setValue(generatedImage || '');
  }, [fields, setValue, hasGenerateImageFn, locale, docInfo]);

  const hasImage = Boolean(value);

  const config = useConfig();

  const { collections, routes: { api } = {}, serverURL } = config;

  const collection = collections?.find((coll) => coll.slug === relationTo) || undefined;

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
          {hasGenerateImageFn && (
            <React.Fragment>
              &nbsp; &mdash; &nbsp;
              <button
                onClick={regenerateImage}
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
        </div>
        {hasGenerateImageFn && (
          <div
            style={{
              color: '#9A9A9A',
            }}
          >
            {t('plugin-seo:imageAutoGenerationTip')}
          </div>
        )}
      </div>
      <div
        style={{
          marginBottom: '10px',
          position: 'relative',
        }}
      >
        <UploadInput
          CustomDescription={CustomDescription}
          CustomError={CustomError}
          CustomLabel={CustomLabel}
          api={api}
          className={className}
          collection={collection}
          descriptionProps={descriptionProps}
          errorProps={errorProps}
          filterOptions={filterOptions}
          label={label}
          labelProps={labelProps}
          onChange={onChange}
          path={path}
          readOnly={readOnly}
          relationTo={relationTo}
          required={required}
          serverURL={serverURL}
          showError={showError}
          style={style}
          value={value}
          width={width}
        />
      </div>
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          width: '100%',
        }}
      >
        <Pill
          backgroundColor={hasImage ? 'green' : 'red'}
          color='white'
          label={hasImage ? t('plugin-seo:good') : t('plugin-seo:noImage')}
        />
      </div>
    </div>
  );
};

export const MetaImage = withCondition(_MetaImage);
