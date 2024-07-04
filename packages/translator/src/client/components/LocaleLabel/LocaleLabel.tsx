import { getTranslation } from '@payloadcms/translations';
import { ChevronIcon, useTranslation } from '@payloadcms/ui';
import type { Locale } from 'payload';

const baseClass = 'localizer-button';

export const LocaleLabel = ({ locale }: { locale: Locale }) => {
  const { i18n, t } = useTranslation();

  return (
    <div aria-label={t('general:locale')} className={baseClass}>
      <div className={`${baseClass}__label`}>{`${t('general:locale')}:`}</div>
      &nbsp;&nbsp;
      <span className={`${baseClass}__current-label`}>
        {`${getTranslation(locale.label, i18n)}`}
      </span>
      &nbsp;
      <ChevronIcon className={`${baseClass}__chevron`} />
    </div>
  );
};
