import { DefaultPublishButton } from '@payloadcms/ui/elements/PublishButton';
import { DefaultSaveButton } from '@payloadcms/ui/elements/SaveButton';

import { CustomButtonWithTranslator } from './CustomButtonWithTranslator';

export const CustomButton = (type: 'publish' | 'save') => {
  return () => {
    const defaultButton = type === 'publish' ? <DefaultPublishButton /> : <DefaultSaveButton />;

    return <CustomButtonWithTranslator defaultButton={defaultButton} />;
  };
};
