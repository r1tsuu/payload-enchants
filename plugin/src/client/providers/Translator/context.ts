import type { Locale } from 'payload/config';
import { createContext, useContext } from 'react';

type TranslatorContextData = {
  localeToTranslateFrom: string;
  localesOptions: Locale[];
  setLocaleToTranslateFrom: (code: string) => void;
  translate: () => Promise<void>;
};

export const TranslatorContext = createContext<TranslatorContextData | null>(null);

export const useTranslator = () => {
  const context = useContext(TranslatorContext);

  if (context === null) throw new Error('useTranslator must be used within TranslatorProvider');
};
