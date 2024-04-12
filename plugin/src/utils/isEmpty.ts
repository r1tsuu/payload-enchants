export const isEmpty = (value: unknown) => {
  if (Array.isArray(value)) return value.length === 0;

  return value === null || typeof value === 'undefined';
};
