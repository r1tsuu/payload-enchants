export const getClientProps = (props: Record<string, unknown>) => {
  const copy = { ...props };

  delete copy['payload'];
  delete copy['i18n'];

  return copy;
};
