import './TranslatorModal.scss';

import { getTranslation } from '@payloadcms/translations';
import { Button, Modal, Popup, PopupList } from '@payloadcms/ui/elements';
import { useModal } from '@payloadcms/ui/elements/Modal';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useTranslation } from '@payloadcms/ui/providers/Translation';

import { useTranslator } from '../../useTranslator';
import { LocalizerLabel } from '../LocalizerLabel';

type Props = {
  slug: string;
};

export const TranslatorModal = ({ slug }: Props) => {
  const { localization } = useConfig();

  const { closeModal } = useModal();

  const { i18n } = useTranslation();

  const { activeLocaleCode, localesOptions, setActiveLocaleCode, translate } = useTranslator({
    onSuccess: () => closeModal(slug),
  });

  if (!localization) return null;

  const activeLocale = localization.locales.find((each) => each.code === activeLocaleCode);

  return (
    <Modal className={'translator__modal'} slug={slug}>
      <div className={'translator__wrapper'}>
        <div className={'translator__content'}>
          <h2>Choose the language to translate from</h2>
          {activeLocale && (
            <Popup
              button={<LocalizerLabel locale={activeLocale} />}
              horizontalAlign='center'
              render={({ close }) => (
                <PopupList.ButtonGroup>
                  {localesOptions.map((option) => {
                    const label = getTranslation(option.label, i18n);

                    return (
                      <PopupList.Button
                        active={option.code === activeLocaleCode}
                        key={option.code}
                        onClick={() => {
                          setActiveLocaleCode(option.code);
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
            ></Popup>
          )}
          <div className={'translator__buttons'}>
            <Button onClick={translate}>Translate</Button>
            <Button onClick={() => closeModal(slug)}>Exit</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
