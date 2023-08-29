import React, { useState, useRef, LegacyRef } from 'react';

import { toast } from 'react-toastify';
import { slateToHtml } from '@slate-serializers/html';
import { htmlToSlate } from '@slate-serializers/html';
import { Config } from '@slate-serializers/dom/src/lib/config/types';
import { useConfig, useDocumentInfo, useLocale } from 'payload/components/utilities';
import { Field } from 'payload/types';
import { useAllFormFields, reduceFieldsToValues, useForm } from 'payload/components/forms';
import { Button } from 'payload/components/elements';
import { CheckboxInput } from 'payload/dist/admin/components/forms/field-types/Checkbox/Input';
import { Fields } from 'payload/dist/admin/components/forms/Form/types';
import Chevron from 'payload/dist/admin/components/icons/Chevron';
import clsx from 'clsx';

// @ts-ignore
import flatley from 'flatley';
import _ from 'lodash';

import {
  templateWithLocalizedFields,
  filterObjectByTemplate,
} from './utils/localized-fields-template';
import { slateToHtmlConfig, htmlToSlateConfig } from './utils/slate';

import { useDisclosure } from './utils/useDisclosure';
import { useOutsideClick } from './utils/useOutsideClick';
import { TranslatorConfig } from '../types';

import './Translator.scss';

const getLocalesOptions = (
  currentLocale: string,
  {
    locales,
    defaultLocale,
  }: {
    locales: string[];
    defaultLocale: string;
  }
) => {
  const getInitialLocale = () => {
    if (currentLocale === defaultLocale) return locales.find((locale) => locale !== defaultLocale);
    return defaultLocale;
  };

  const options = locales
    .filter((eachLocale) => eachLocale !== currentLocale)
    .map((locale) => locale);

  return {
    localesOptions: options,
    initialLocale: getInitialLocale(),
  };
};

export const Translator =
  (translatorConfig: TranslatorConfig): React.FC =>
  () => {
    const [fields, dispatchFields] = useAllFormFields();
    const { setModified } = useForm();

    const { collection, global, id, slug: docSlug } = useDocumentInfo();
    const locale = useLocale();
    const config = useConfig();

    const { initialLocale, localesOptions } =
      config.localization && (getLocalesOptions(locale, config.localization) as any);

    const [localeTranslateFrom, setLocaleTranslateFrom] = useState(initialLocale);

    const filteredLocalesOptions = localesOptions.filter(
      (locale: string) => locale !== localeTranslateFrom
    );

    const localeTranslateFromDropdown = useDisclosure();
    const localeTranslateFromDropdownRef: LegacyRef<undefined | HTMLSpanElement> = useRef();

    useOutsideClick(localeTranslateFromDropdownRef, localeTranslateFromDropdown.onClose);

    const [translateOnlyEmptyFields, setTranslateOnlyEmptyFields] = useState(true);

    const toggleTranslateOnlyEmptyFields = () => setTranslateOnlyEmptyFields((prev) => !prev);

    const [isLoading, setIsLoading] = useState(false);

    const translate = async () => {
      setIsLoading(true);

      const template = templateWithLocalizedFields(
        collection ? collection.fields : (global?.fields as Field[])
      );
      const { slug, ...values } = reduceFieldsToValues(fields);

      const fieldsToTranslate = filterObjectByTemplate(template, values, translateOnlyEmptyFields);

      const translateFromDocResponse = await fetch(
        `/api/${global ? '/globals/' : ''}${docSlug}${
          collection ? `/${id}` : ''
        }?locale=${localeTranslateFrom}&depth=0`,
        {
          credentials: 'include',
        }
      );

      const translateFromDoc = await translateFromDocResponse.json();

      const flatTranslateFromDoc = flatley(translateFromDoc, {
        filters: [
          {
            test: (key: string, value: unknown) =>
              Array.isArray(value) && fieldsToTranslate.includes(key),
          },
        ],
      });

      const objectToTranslate = fieldsToTranslate.reduce<{ [key: string]: string }>((acc, key) => {
        if (flatTranslateFromDoc[key]) {
          acc[key] = flatTranslateFromDoc[key];
        }
        return acc;
      }, {});

      if (!Object.keys(objectToTranslate).length) {
        toast.error('No fields to translate');
        setIsLoading(false);
        return;
      }

      const valuesToTranslate = Object.values(objectToTranslate).map((value) => {
        const isRichText = typeof value === 'object';
        return {
          value: isRichText
            ? slateToHtml(
                value,
                translatorConfig.slateToHtmlConfig || (slateToHtmlConfig as Config)
              )
            : value,
          isRichText,
        };
      });

      try {
        const response = await fetch('/api/translator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            texts: valuesToTranslate.map(({ value }) => value),
            from: localeTranslateFrom,
            to: locale,
          }),
        });

        const translatedValues = await response.json();

        setIsLoading(false);

        const translatedObject = Object.keys(objectToTranslate).reduce<{
          [key: string]: { value: string; initialValue?: number };
        }>((acc, key, index) => {
          if (valuesToTranslate[index].isRichText) {
            acc[key] = {
              value: htmlToSlate(
                translatedValues[index],
                translatorConfig.htmlToSlateConfig || htmlToSlateConfig
              ) as any,
              initialValue: Math.random(),
            };
          } else acc[key] = { value: translatedValues[index] as string };
          return acc;
        }, {});

        dispatchFields({
          type: 'REPLACE_STATE',
          state: {
            ...fields,
            ...translatedObject,
          } as Fields,
        });

        setModified(true);
      } catch (error: any) {
        toast.error('Server error');
        setIsLoading(false);
      }
    };

    if (global || id)
      return (
        <div className="translator-wrapper">
          <Button disabled={isLoading} size="small" onClick={translate}>
            <span>Translate content</span>
            {/* {isLoading && <Loader size={'sm'} />}  */}
          </Button>

          <div>
            <div>Current locale: {locale.toUpperCase()}</div>
            <div className="locale-select">
              <span>Translate from </span>
              <span
                ref={localeTranslateFromDropdownRef as any}
                className={clsx(
                  'locale-select__dropdown',
                  localeTranslateFromDropdown.isOpen && 'open'
                )}
              >
                <span className="locale-select__current">{localeTranslateFrom.toUpperCase()}</span>
                {filteredLocalesOptions.length > 0 && (
                  <>
                    <span
                      className="locale-select__button"
                      onClick={localeTranslateFromDropdown.onToggle}
                    >
                      <Chevron />
                    </span>
                    <span className="locale-select__list">
                      {filteredLocalesOptions.map((locale: string) => (
                        <span key={locale} onClick={() => setLocaleTranslateFrom(locale)}>
                          {locale.toUpperCase()}
                        </span>
                      ))}
                    </span>
                  </>
                )}
              </span>
            </div>
            <CheckboxInput
              onToggle={toggleTranslateOnlyEmptyFields}
              checked={translateOnlyEmptyFields}
              label="Translate only empty fields"
            />
          </div>
        </div>
      );

    return null;
  };
