import type { RichTextAdapter } from 'payload/types';

import { LocalizedField } from './components/LocalizedField';
import type { BetterLocalizedFieldsOptions } from './types';
import { getClientProps } from './utils/getClientProps';

export const attachLocalizedFieldToEditor = ({
  editor,
  options,
}: {
  editor: RichTextAdapter;
  options: BetterLocalizedFieldsOptions;
}) => {
  const incomingEditor = { ...editor };

  delete (editor as any)['FieldComponent'];

  const LocaleTabButtonCustom = options.addons?.find(
    (each) => each.LocaleTabButton,
  )?.LocaleTabButton;

  editor.FieldComponent = (props) => {
    return (
      <LocalizedField
        {...getClientProps(props)}
        customField={<incomingEditor.FieldComponent {...props} />}
        customTabButton={LocaleTabButtonCustom && <LocaleTabButtonCustom />}
        type='richText'
      />
    );
  };
};
