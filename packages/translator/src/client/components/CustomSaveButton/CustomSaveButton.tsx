'use client';

import './styles.scss';

import { DefaultSaveButton } from '@payloadcms/ui/elements/Save';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useDocumentInfo } from '@payloadcms/ui/providers/DocumentInfo';

import type { TranslateResolver } from '../../../resolvers/types';
import { TranslatorProvider } from '../../providers/Translator/TranslatorProvider';
import { ResolverButton } from '../ResolverButton';
import { TranslatorModal } from '../TranslatorModal';

export const CustomSaveButton = () => {
  const config = useConfig();

  const { globalSlug, id } = useDocumentInfo();

  const resolvers = (config.admin?.custom?.translator?.resolvers as TranslateResolver[]) ?? [];

  if (!id && !globalSlug) return <DefaultSaveButton />;

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
