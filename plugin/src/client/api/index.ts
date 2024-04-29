import type { TranslateEndpointArgs, TranslateResult } from '../../translate/types';

export const createClient = ({ api, serverURL }: { api: string; serverURL: string }) => {
  const translate = async (args: TranslateEndpointArgs): Promise<TranslateResult> => {
    try {
      const response = await fetch(`${serverURL}${api}/translator/translate`, {
        body: JSON.stringify(args),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) return { success: false };

      return response.json();
    } catch (e) {
      if (e instanceof Error) console.error(e.message);

      return { success: false };
    }
  };

  return {
    translate,
  };
};
