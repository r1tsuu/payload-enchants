export const chunkArray = <T>(array: T[], length: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / length) }, (_, i) =>
    array.slice(i * length, i * length + length),
  );
};
