import * as RadixDialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  className?: string;
  trigger?: ReactNode;
} & RadixDialog.DialogProps;

export const Dialog = ({ children, className, trigger, ...dialogProps }: Props) => {
  return (
    <RadixDialog.Root {...dialogProps}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay asChild>
          <div className={clsx('dialog-overlay', className)}>
            <RadixDialog.Content asChild>
              <div className={'dialog-content'}>
                <RadixDialog.Close className='close'>
                  <svg
                    height='100'
                    viewBox='0 0 50 50'
                    width='100'
                    x='0px'
                    xmlns='http://www.w3.org/2000/svg'
                    y='0px'
                  >
                    <path d='M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z'></path>
                  </svg>
                </RadixDialog.Close>
                {children}
              </div>
            </RadixDialog.Content>
          </div>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
