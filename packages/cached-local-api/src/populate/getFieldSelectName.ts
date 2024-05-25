export const getFieldSelectName = (fieldPath: string) => {
  if (fieldPath.startsWith('.')) {
    return fieldPath.substring(1);
  }

  return fieldPath;
};
