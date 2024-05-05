'use client';

import { createContext, useContext } from 'react';

export type ContextValue = {
  activeLocaleTab: string;
  localeCode: string;
  setLocaleTab: (locale: string) => void;
};

export const LocaleTabButtonContext = createContext<ContextValue>({
  activeLocaleTab: '',
  localeCode: '',
  setLocaleTab: () => {},
});

export const useLocaleTabButton = () => useContext(LocaleTabButtonContext);
