import _ from 'lodash';

const parseCode = (code: string) => {
  if (code === 'ua') return 'uk';
  if (code === 'jp') return 'ja';
  return code;
};

export const translateServiceGoogle = async (
  text: string,
  target: string,
  source: string,
  apiKey: string
) => {
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

  const { data, ...rest } = await response.json();

  return data.translations[0].translatedText;
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

export async function translateArrayGoogle(
  array: string[],
  target: string,
  source: string,
  apiKey: string
) {
  const tasks = array.map((text) => translateServiceGoogle(text, target, source, apiKey));
  return Promise.all(tasks);
}
