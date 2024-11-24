'use client';

import './styles.scss';

import { PublishButton, SaveButton, useConfig, useDocumentInfo } from '@payloadcms/ui';

import type { TranslateResolver } from '../../../resolvers/types';
import { TranslatorProvider } from '../../providers/Translator/TranslatorProvider';
import { ResolverButton } from '../ResolverButton';
import { TranslatorModal } from '../TranslatorModal';

export const CustomButtonWithTranslator = ({ type }: { type: 'publish' | 'save' }) => {
  const { config } = useConfig();

  const DefaultButton = type === 'publish' ? PublishButton : SaveButton;

  const { globalSlug, id } = useDocumentInfo();

  const resolvers = (config.admin?.custom?.translator?.resolvers as TranslateResolver[]) ?? [];

  if (!id && !globalSlug) return <DefaultButton />;

  return (
    <TranslatorProvider>
      <div className={'translator__custom-save-button'}>
        <TranslatorModal />
        {resolvers.map((resolver) => (
          <ResolverButton key={resolver.key} resolver={resolver} />
        ))}
        {<DefaultButton />}
      </div>
    </TranslatorProvider>
  );
};
