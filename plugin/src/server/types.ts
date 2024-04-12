export type ValueToTranslate = {
  onTranslate: (translatedValue: any) => Promise<void> | void;
  value: any;
};
