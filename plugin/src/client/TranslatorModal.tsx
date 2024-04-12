import { getTranslation } from '@payloadcms/translations';
import { Button, Modal, Popup, PopupList } from '@payloadcms/ui/elements';
import { useModal } from '@payloadcms/ui/elements/Modal';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useTranslation } from '@payloadcms/ui/providers/Translation';

import { LocalizerLabel } from './LocaleLabel';
import styles from './TranslatorModal.module.scss';
import { useTranslator } from './useTranslator';

type Props = {
  slug: string;
};

export const TranslatorModal = ({ slug }: Props) => {
  const { localization } = useConfig();

  const { closeModal } = useModal();

  const { i18n } = useTranslation();

  const { activeLocaleCode, localesOptions, setActiveLocaleCode, translate } = useTranslator();

  if (!localization) return null;

  const activeLocale = localization.locales.find((each) => each.code === activeLocaleCode);

  return (
    <Modal className={styles.modal} slug={slug}>
      <div className={styles.wrapper}>
        <div className={styles.content}>
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
          <div className={styles.buttons}>
            <Button onClick={translate}>Translate</Button>
            <Button onClick={() => closeModal(slug)}>Exit</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
