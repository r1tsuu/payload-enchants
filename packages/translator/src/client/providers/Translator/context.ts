import type { Locale } from 'payload';
import { createContext, useContext } from 'react';

import type { TranslateResolver } from '../../../resolvers/types';

type TranslatorContextData = {
  closeTranslator: () => void;
  localeToTranslateFrom: string;
  localesOptions: Locale[];
  modalSlug: string;
  openTranslator: (args: { resolverKey: string }) => void;
  resolver: TranslateResolver | null;
  resolverT: (
    key:
      | 'buttonLabel'
      | 'errorMessage'
      | 'modalTitle'
      | 'submitButtonLabelEmpty'
      | 'submitButtonLabelFull'
      | 'successMessage',
  ) => string;
  setLocaleToTranslateFrom: (code: string) => void;
  submit: (args: { emptyOnly: boolean }) => Promise<void>;
};

export const TranslatorContext = createContext<TranslatorContextData | null>(null);

export const useTranslator = () => {
  const context = useContext(TranslatorContext);

  if (context === null) throw new Error('useTranslator must be used within TranslatorProvider');

  return context;
};
