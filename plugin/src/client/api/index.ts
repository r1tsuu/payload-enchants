import type { TranslateHandlerArgs, TranslateHandlerResponse } from '../../types';

export const getClient = ({ api, serverURL }: { api: string; serverURL: string }) => {
  const translate = (args: TranslateHandlerArgs): Promise<TranslateHandlerResponse> => {
    return fetch(`${serverURL}${api}/translator/translate`, {
      body: JSON.stringify(args),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }).then((res) => res.json());
  };

  return { translate };
};
