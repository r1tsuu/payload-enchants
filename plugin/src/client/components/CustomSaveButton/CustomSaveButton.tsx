'use client';

import './styles.scss';

import { DefaultSaveButton } from '@payloadcms/ui/elements/Save';
import { useConfig } from '@payloadcms/ui/providers/Config';

import type { TranslateResolver } from '../../../resolvers/types';
import { TranslatorProvider } from '../../providers/Translator/TranslatorProvider';
import { ResolverButton } from '../ResolverButton';
import { TranslatorModal } from '../TranslatorModal';

export const CustomSaveButton = () => {
  const config = useConfig();

  const resolvers = (config.admin?.custom?.translator?.resolvers as TranslateResolver[]) ?? [];

  return (
    <TranslatorProvider>
      <div className={'translator__custom-save-button'}>
        <TranslatorModal />
        {resolvers.map((resolver) => (
          <ResolverButton key={resolver.key} resolver={resolver} />
        ))}
        <DefaultSaveButton />
      </div>
    </TranslatorProvider>
  );
};
