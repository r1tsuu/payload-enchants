import { DefaultPublishButton, DefaultSaveButton } from '@payloadcms/ui';

import { CustomButtonWithTranslator } from './CustomButtonWithTranslator';

export const CustomButton = (type: 'publish' | 'save') => {
  return () => {
    const defaultButton = type === 'publish' ? <DefaultPublishButton /> : <DefaultSaveButton />;

    return <CustomButtonWithTranslator defaultButton={defaultButton} />;
  };
};
