'use client';

import './index.scss';

import { Button } from '@payloadcms/ui/elements';
import { DatePickerField } from '@payloadcms/ui/elements/DatePicker';
import { useField } from '@payloadcms/ui/forms/useField';
import { useRef } from 'react';

export const SchedulePublish = () => {
  const hasChanged = useRef(false);

  const scheduledAtField = useField({
    path: 'scheduledAt',
  });

  return (
    <>
      <Button disabled={!scheduledAtField.value || !hasChanged.current} size='small'>
        Schedule
      </Button>
      <DatePickerField
        displayFormat='dd/MM/yyyy HH:mm'
        minDate={new Date()}
        onChange={(value) => {
          hasChanged.current = true;
          scheduledAtField.setValue(value?.toISOString());
        }}
        pickerAppearance='dayAndTime'
        placeholder='Schedule publish at'
        timeFormat='HH:mm'
        timeIntervals={10}
        value={scheduledAtField.value ? new Date(scheduledAtField.value as string) : undefined}
      />
    </>
  );
};
