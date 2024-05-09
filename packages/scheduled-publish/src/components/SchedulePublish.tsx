'use client';

import './index.scss';

import { DatePickerField } from '@payloadcms/ui/elements/DatePicker';
import { useField } from '@payloadcms/ui/forms/useField';

export const SchedulePublish = () => {
  const scheduledAtField = useField({
    path: 'scheduledAt',
  });

  return (
    <>
      <DatePickerField
        displayFormat='dd/MM/yyyy HH:mm'
        minDate={new Date()}
        onChange={(value) => scheduledAtField.setValue(value?.toISOString())}
        pickerAppearance='dayAndTime'
        placeholder='Schedule publish at'
        timeFormat='HH:mm'
        timeIntervals={10}
        value={scheduledAtField.value ? new Date(scheduledAtField.value as string) : undefined}
      />
    </>
  );
};
