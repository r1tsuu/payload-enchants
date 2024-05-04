import type { SaveChangesArgs, SaveChangesResult } from './types';

export const saveChanges = async ({
  api,
  args,
}: {
  api: string;
  args: SaveChangesArgs;
}): Promise<SaveChangesResult> => {
  const response = await fetch(`${api}/collection-docs-order/save`, {
    body: JSON.stringify(args),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'post',
  });

  if (!response.ok) return { success: false };

  return response.json();
};
