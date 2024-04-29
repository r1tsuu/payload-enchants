import type { TranslateResolver } from './types';

export const copyResolver = (): TranslateResolver => {
  return {
    key: 'copy',
    resolve: (args) => {
      const { texts } = args;

      return {
        success: true,
        translatedTexts: texts,
      };
    },
  };
};
