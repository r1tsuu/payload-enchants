'use client';

import type { FormState } from 'payload';
import { createContext, useContext } from 'react';

export const LocalesDataContext = createContext<{
  localesFormState: {
    formState: FormState;
    localeCode: string;
    localeLabel: string;
  }[];
}>({ localesFormState: [] });

export const useLocalesData = () => {
  const context = useContext(LocalesDataContext);

  if (!context) throw new Error(`useLocalesData should be used within provider`);

  return context;
};
