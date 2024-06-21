import { getTranslation } from '@payloadcms/translations';
import { Button, Popup, PopupList, useTranslation } from '@payloadcms/ui';

import { useTranslator } from '../../providers/Translator/context';
import { LocaleLabel } from '../LocaleLabel';

export const Content = () => {
  const {
    localeToTranslateFrom: localeCodeToTranslateFrom,
    localesOptions,
    resolverT,
    setLocaleToTranslateFrom,
    submit,
  } = useTranslator();

  const { i18n } = useTranslation();

  const localeToTranslateFrom = localesOptions.find(
    (each) => each.code === localeCodeToTranslateFrom,
  );

  return (
    <div className={'translator__content'}>
      <h2>{resolverT('modalTitle')}</h2>
      {localeToTranslateFrom && (
        <Popup
          button={<LocaleLabel locale={localeToTranslateFrom} />}
          horizontalAlign='center'
          render={({ close }) => (
            <PopupList.ButtonGroup>
              {localesOptions.map((option) => {
                const label = getTranslation(option.label, i18n);

                return (
                  <PopupList.Button
                    active={option.code === localeCodeToTranslateFrom}
                    key={option.code}
                    onClick={() => {
                      setLocaleToTranslateFrom(option.code);
                      close();
                    }}
                  >
                    {label}
                    {label !== option.code && ` (${option.code})`}
                  </PopupList.Button>
                );
              })}
            </PopupList.ButtonGroup>
          )}
          verticalAlign='bottom'
        />
      )}
      <div className={'translator__buttons'}>
        <Button onClick={() => submit({ emptyOnly: false })}>
          {resolverT('submitButtonLabelFull')}
        </Button>
        <Button onClick={() => submit({ emptyOnly: true })}>
          {resolverT('submitButtonLabelEmpty')}
        </Button>
      </div>
    </div>
  );
};
