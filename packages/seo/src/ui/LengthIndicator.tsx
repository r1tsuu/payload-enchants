'use client';

import { useTranslation } from '@payloadcms/ui/providers/Translation';
import React, { Fragment, useEffect, useState } from 'react';

import { Pill } from './Pill';

export const LengthIndicator: React.FC<{
  maxLength?: number;
  minLength?: number;
  text?: string;
}> = (props) => {
  const { maxLength = 0, minLength = 0, text } = props;

  const [labelStyle, setLabelStyle] = useState({
    backgroundColor: '',
    color: '',
  });

  const [label, setLabel] = useState('');

  const [barWidth, setBarWidth] = useState<number>(0);

  const { t } = useTranslation();

  type TArg = Parameters<typeof t>[0];

  useEffect(() => {
    const textLength = text?.length || 0;

    if (textLength === 0) {
      setLabel('Missing');
      setLabelStyle({
        backgroundColor: 'red',
        color: 'white',
      });
      setBarWidth(0);
    } else {
      const progress = (textLength - minLength) / (maxLength - minLength);

      if (progress < 0) {
        const ratioUntilMin = textLength / minLength;

        if (ratioUntilMin > 0.9) {
          setLabel(t('plugin-seo:almostThere' as TArg));
          setLabelStyle({
            backgroundColor: 'orange',
            color: 'white',
          });
        } else {
          setLabel(t('plugin-seo:tooShort' as TArg));
          setLabelStyle({
            backgroundColor: 'orangered',
            color: 'white',
          });
        }

        setBarWidth(ratioUntilMin);
      }

      if (progress >= 0 && progress <= 1) {
        setLabel(t('plugin-seo:good' as TArg));
        setLabelStyle({
          backgroundColor: 'green',
          color: 'white',
        });
        setBarWidth(progress);
      }

      if (progress > 1) {
        setLabel(t('plugin-seo:tooLong' as TArg));
        setLabelStyle({
          backgroundColor: 'red',
          color: 'white',
        });
        setBarWidth(1);
      }
    }
  }, [minLength, maxLength, text, t]);

  const textLength = text?.length || 0;

  const charsUntilMax = maxLength - textLength;

  const charsUntilMin = minLength - textLength;

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        width: '100%',
      }}
    >
      <Pill backgroundColor={labelStyle.backgroundColor} color={labelStyle.color} label={label} />
      <div
        style={{
          flexShrink: 0,
          lineHeight: 1,
          marginRight: '10px',
          whiteSpace: 'nowrap',
        }}
      >
        <small>
          {t('plugin-seo:characterCount' as TArg, {
            current: text?.length || 0,
            maxLength,
            minLength,
          })}
          {(textLength === 0 || charsUntilMin > 0) && (
            <Fragment>
              {t('plugin-seo:charactersToGo' as TArg, { characters: charsUntilMin })}
            </Fragment>
          )}
          {charsUntilMin <= 0 && charsUntilMax >= 0 && (
            <Fragment>
              {t('plugin-seo:charactersLeftOver' as TArg, { characters: charsUntilMax })}
            </Fragment>
          )}
          {charsUntilMax < 0 && (
            <Fragment>
              {t('plugin-seo:charactersTooMany' as TArg, { characters: charsUntilMax * -1 })}
            </Fragment>
          )}
        </small>
      </div>
      <div
        style={{
          backgroundColor: '#F3F3F3',
          height: '2px',
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            backgroundColor: labelStyle.backgroundColor,
            height: '100%',
            left: 0,
            position: 'absolute',
            top: 0,
            width: `${barWidth * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
