import { CustomPublishButton, CustomSaveButton } from 'payload';

export const CustomButton = (type: 'publish' | 'save'): CustomSaveButton | CustomPublishButton => {
  return {
    path: `@payload-enchants/translator/client#CustomButtonWithTranslator`,
    clientProps: {
      type,
    },
  };
};
