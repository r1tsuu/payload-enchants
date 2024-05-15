import { Button } from '@payloadcms/ui/elements';
import { useTranslation } from '@payloadcms/ui/providers/Translation';

import type { TranslateResolver } from '../../../resolvers/types';
import { useTranslator } from '../../providers/Translator/context';

export const ResolverButton = ({
  resolver: { key: resolverKey },
}: {
  resolver: TranslateResolver;
}) => {
  const { openTranslator } = useTranslator();

  const { t } = useTranslation();

  const handleClick = () => openTranslator({ resolverKey });

  return (
    <Button onClick={handleClick} size='small'>
      {t(`plugin-translator:resolver_${resolverKey}_buttonLabel` as Parameters<typeof t>[0])}
    </Button>
  );
};
