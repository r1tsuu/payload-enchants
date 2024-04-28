'use client';

import './CustomSaveButton.scss';

import { Button } from '@payloadcms/ui/elements';
import { useModal } from '@payloadcms/ui/elements/Modal';
import { DefaultSaveButton } from '@payloadcms/ui/elements/Save';
import { useConfig } from '@payloadcms/ui/providers/Config';

import { TranslatorModal } from '../TranslatorModal';

const modalSlug = 'translator-modal';

export const CustomSaveButton = () => {
  const { isModalOpen, openModal } = useModal();

  const config = useConfig();

  console.log(config.collections);

  return (
    <div className={'translator__custom-save-button'}>
      {isModalOpen(modalSlug) && <TranslatorModal slug={modalSlug} />}
      <Button onClick={() => openModal(modalSlug)} size='small'>
        Translate content
      </Button>
      <DefaultSaveButton />
    </div>
  );
};
