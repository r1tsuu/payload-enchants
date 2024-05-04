import type { RichTextAdapter } from 'payload/types';

import { LocalizedField } from './components/LocalizedField';

export const attachLocalizedFieldToEditor = (editor: RichTextAdapter) => {
  const incomingEditor = { ...editor };

  delete (editor as any)['FieldComponent'];

  editor.FieldComponent = (props) => {
    return (
      <LocalizedField
        {...props}
        customField={<incomingEditor.FieldComponent {...props} />}
        type='richText'
      />
    );
  };
};
