import type { TranslateResolver } from './types';

export const copyResolver = (): TranslateResolver => {
  return (args) => {
    const { texts } = args;

    return {
      translatedTexts: texts,
    };
  };
};
