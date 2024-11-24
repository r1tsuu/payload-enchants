export const traverseRichText = ({
  onText,
  root,
  siblingData,
}: {
  onText: (siblingData: Record<string, unknown>) => void;
  root: Record<string, unknown>;
  siblingData?: Record<string, unknown>;
}) => {
  siblingData = siblingData ?? root;

  if (siblingData.text) {
    onText(siblingData);
  }

  if (Array.isArray(siblingData?.children)) {
    for (const child of siblingData.children) {
      traverseRichText({
        onText,
        root,
        siblingData: child,
      });
    }
  }
};
