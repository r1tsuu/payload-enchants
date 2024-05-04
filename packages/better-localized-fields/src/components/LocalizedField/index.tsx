'use client';

import './index.scss';

import { useFieldProps } from '@payloadcms/ui/forms/FieldPropsProvider';
import { FormContext, FormFieldsContext, FormWatchContext } from '@payloadcms/ui/forms/Form';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useFieldComponents } from '@payloadcms/ui/providers/FieldComponents';
import { useLocale } from '@payloadcms/ui/providers/Locale';
import { reduceFieldsToValues } from '@payloadcms/ui/utilities/reduceFieldsToValues';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { cloneElement, useEffect, useState } from 'react';

import { useLocalesData } from '../../providers/LocalesData/context';
import { getDataByPath } from '../../utils/getDataByPath';
import { getSiblingDataByPath } from '../../utils/getSiblingDataByPath';

export const LocalizedField = ({
  customField,
  type,
  ...fieldComponentProps
}: {
  customField?: ReactNode;

  type:
    | 'array'
    | 'blocks'
    | 'checkbox'
    | 'code'
    | 'date'
    | 'email'
    | 'group'
    | 'json'
    | 'number'
    | 'point'
    | 'radio'
    | 'relationship'
    | 'richText'
    | 'select'
    | 'text'
    | 'textarea';
}) => {
  const fieldComponents = useFieldComponents();

  const config = useConfig();

  const { localesFormState } = useLocalesData();

  const locale = useLocale();

  console.log(localesFormState);

  const { custom } = useFieldProps();

  const FieldComponent = fieldComponents[type];

  const [activeLocaleTab, setActiveLocaleTab] = useState(locale.code);

  useEffect(() => {
    setActiveLocaleTab(locale.code);
  }, [locale.code]);

  if (type == 'richText' && !custom?.localized)
    return customField ?? <FieldComponent {...(fieldComponentProps as any)} />;

  if (!config.localization) return;

  const localesOptions = config.localization.localeCodes.toSorted((each) =>
    each === locale.code ? -1 : 1,
  );

  const getFormContextValue = (
    locale: string,
  ): ComponentProps<typeof FormContext.Provider>['value'] | null => {
    const value = localesFormState.find((each) => each.localeCode === locale)!;

    if (!value) return null;
    const { formState } = value;

    return {
      addFieldRow: () => {},
      fields: formState,
      getData: () => {
        return reduceFieldsToValues(formState, true);
      },
      getDataByPath: (path: string) => {
        return getDataByPath(formState, path);
      },
      getField: (path: string) => formState[path],
      getFields: () => formState,
      getSiblingData: (path: string) => {
        return getSiblingDataByPath(formState, path);
      },
    } as any;
  };

  const formContextValue = activeLocaleTab !== locale.code && getFormContextValue(activeLocaleTab);

  return (
    <div className='plugin-indicator__field-wrapper field-type'>
      <div className='tabs-field__tabs plugin-indicator__tabs'>
        {localesOptions.map((code) => (
          <div
            className={`tabs-field__tab-button ${code === activeLocaleTab ? 'tabs-field__tab-button--active' : ''}`}
            key={code}
            onClick={() => setActiveLocaleTab(code)}
          >
            {code.toUpperCase()}
          </div>
        ))}
      </div>
      {activeLocaleTab === locale.code
        ? customField ?? <FieldComponent {...(fieldComponentProps as any)} />
        : formContextValue && (
            <FormContext.Provider value={formContextValue}>
              <FormWatchContext.Provider value={formContextValue}>
                <FormFieldsContext.Provider value={[formContextValue.fields, () => {}]}>
                  {customField ? (
                    cloneElement(customField as ReactElement, { readOnly: true })
                  ) : (
                    <FieldComponent readOnly {...(fieldComponentProps as any)} />
                  )}
                </FormFieldsContext.Provider>
              </FormWatchContext.Provider>
            </FormContext.Provider>
          )}
    </div>
  );
};
