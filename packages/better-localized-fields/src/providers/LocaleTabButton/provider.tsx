'use client';

import type { ReactNode } from 'react';

import type { ContextValue } from './context';
import { LocaleTabButtonContext } from './context';

export const LocaleTabButtonProvider = ({
  children,
  ...value
}: {
  children: ReactNode;
} & ContextValue) => {
  return (
    <LocaleTabButtonContext.Provider value={value}>{children}</LocaleTabButtonContext.Provider>
  );
};
