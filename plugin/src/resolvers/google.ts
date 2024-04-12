import { chunkArray } from '../utils/chunkArray';
import type { TranslateResolver } from './types';

type GoogleResponse = {
  data: {
    translations: {
      detectedSourceLanguage: string;
      model: string;
      translatedText: string;
    }[];
  };
};

export type GoogleResolverConfig = {
  apiKey: string;
  chunkLength?: number;
};

export const getGoogleResolver = ({
  apiKey,
  chunkLength = 100,
}: GoogleResolverConfig): TranslateResolver => {
  return async (args) => {
    const { localeFrom, localeTo, texts } = args;

    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const responses: GoogleResponse[] = await Promise.all(
      chunkArray(texts, chunkLength).map((q) =>
        fetch(apiUrl, {
          body: JSON.stringify({
            q,
            source: localeFrom,
            target: localeTo,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }).then((res) => res.json()),
      ),
    );

    const translatedTexts = responses
      .flatMap((chunk) => chunk.data.translations)
      .map((translation) => translation.translatedText);

    return {
      translatedTexts,
    };
  };
};
