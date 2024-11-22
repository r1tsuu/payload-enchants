import { chunkArray } from '../utils/chunkArray';
import type { TranslateResolver } from './types';

type LibreResponse = {
  data: {
    translatedText: string[];
  };
  success: boolean;
};

const localeToCountryCodeMapper = {
  ua: 'uk',
};

const mapLocale = (incoming: string) =>
  incoming in localeToCountryCodeMapper
    ? localeToCountryCodeMapper[incoming as keyof typeof localeToCountryCodeMapper]
    : incoming;

export type LibreResolverConfig = {
  apiKey: string;
  /**
   * How many texts to include into 1 request
   * @default 100
   */
  chunkLength?: number;
  /**
   * Custom url for the libre translate instance
   * @default "https://libretranslate.com/translate"
   */
  url?: string;
};

export const libreResolver = ({
  apiKey,
  chunkLength = 100,
  url = 'https://libretranslate.com/translate',
}: LibreResolverConfig): TranslateResolver => {
  return {
    key: 'libre',
    resolve: async (args) => {
      const { localeFrom, localeTo, req, texts } = args;

      const apiUrl = url;

      const responses: LibreResponse[] = await Promise.all(
        chunkArray(texts, chunkLength).map((q) =>
          fetch(apiUrl, {
            body: JSON.stringify({
              api_key: apiKey,
              q,
              source: mapLocale(localeFrom),
              target: mapLocale(localeTo),
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          }).then(async (res) => {
            const data = await res.json();

            if (!res.ok)
              req.payload.logger.info({
                libreResponse: data,
                message:
                  'An error occurred when trying to translate the data using LibreTranslate API',
              });

            return {
              data,
              success: res.ok,
            };
          }),
        ),
      );

      if (responses.some((res) => !res.success)) {
        return {
          success: false,
        };
      }

      const translatedTexts = responses.flatMap((chunk) => chunk.data.translatedText);

      return {
        success: true,
        translatedTexts,
      };
    },
  };
};
