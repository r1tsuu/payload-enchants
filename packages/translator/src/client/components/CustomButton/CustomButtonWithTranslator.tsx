'use client';

import './styles.scss';

import { useConfig } from '@payloadcms/ui/providers/Config';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';
import type { ReactNode } from 'react';

import type { TranslateResolver } from '../../../resolvers/types';
import { TranslatorProvider } from '../../providers/Translator/TranslatorProvider';
import { ResolverButton } from '../ResolverButton';
import { TranslatorModal } from '../TranslatorModal';

export const CustomButtonWithTranslator = ({ defaultButton }: { defaultButton: ReactNode }) => {
  const config = useConfig();

  const { globalSlug, id } = useDocumentInfo();

  const resolvers = (config.admin?.custom?.translator?.resolvers as TranslateResolver[]) ?? [];

  if (!id && !globalSlug) return defaultButton;

  return (
    <TranslatorProvider>
      <div className={'translator__custom-save-button'}>
        <TranslatorModal />
        {resolvers.map((resolver) => (
          <ResolverButton key={resolver.key} resolver={resolver} />
        ))}
        {defaultButton}
      </div>
    </TranslatorProvider>
  );
};
