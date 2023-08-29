import _ from 'lodash';

const parseCode = (code: string) => {
  if (code === 'ua') return 'uk';
  if (code === 'jp') return 'ja';
  return code;
};

export const createGoogleTranslateService = (apiKey: string) => {
  return async (text: string, target: string, source: string) => {
    const apiUrl = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify({
        q: text,
        target: parseCode(target),
        source: parseCode(source),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { data } = await response.json();

    return data.translations[0].translatedText as string;
  };
};
