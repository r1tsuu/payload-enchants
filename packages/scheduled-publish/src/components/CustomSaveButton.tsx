'use client';

import './index.scss';

import type { ReactNode } from 'react';

import { SchedulePublish } from './SchedulePublish';

export const CustomSaveButton = ({
  defaultSaveButton,
  incomingCustomSaveButton,
}: {
  defaultSaveButton: ReactNode;
  incomingCustomSaveButton: ReactNode;
}) => {
  return (
    <>
      {incomingCustomSaveButton ?? defaultSaveButton}
      <SchedulePublish />
    </>
  );
};
