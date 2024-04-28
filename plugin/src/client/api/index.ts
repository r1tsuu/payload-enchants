import type {
  GetLocalesListHandlerArgs,
  TranslateHandlerArgs,
  TranslateHandlerResponse,
} from '../../types';

export const createClient = ({ api, serverURL }: { api: string; serverURL: string }) => {
  const translate = async (args: TranslateHandlerArgs): Promise<TranslateHandlerResponse> => {
    const response = await fetch(`${serverURL}${api}/translator/translate`, {
      body: JSON.stringify(args),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    return response.json();
  };

  // const getLocalesList = async (args: GetLocalesListHandlerArgs): Promise<GetLoca

  return {
    translate,
  };
};
