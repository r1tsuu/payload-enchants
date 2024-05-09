'use client';

import './index.scss';

import { DefaultSaveButton } from '@payloadcms/ui/elements/Save';
import type { ReactNode } from 'react';

import { SchedulePublish } from './SchedulePublish';

export const CustomSaveButton = ({
  incomingCustomSaveButton,
}: {
  incomingCustomSaveButton: ReactNode;
}) => {
  return (
    <>
      {incomingCustomSaveButton ?? <DefaultSaveButton />}
      <SchedulePublish />
    </>
  );
};
