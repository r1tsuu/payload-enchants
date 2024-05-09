export const getClientProps = (props: Record<string, unknown>) => {
  const copy = { ...props };

  delete copy['payload'];

  return copy;
};
