import type { ComponentType } from 'react';

export type LocaleTabButtonComponent = ComponentType;

export type BetterLocalizedFieldsAddon = {
  LocaleTabButton?: ComponentType;
};

export type BetterLocalizedFieldsOptions = {
  addons?: BetterLocalizedFieldsAddon[];
  disabled?: boolean;
};
