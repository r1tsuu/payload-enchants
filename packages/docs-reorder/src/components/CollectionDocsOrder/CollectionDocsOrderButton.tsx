'use client';

import { Button, toast } from '@payloadcms/ui/elements';
import { DraggableSortable } from '@payloadcms/ui/elements/DraggableSortable';
import { DraggableSortableItem } from '@payloadcms/ui/elements/DraggableSortable/DraggableSortableItem';
import { Radio } from '@payloadcms/ui/fields/RadioGroup/Radio';
import { DragHandle } from '@payloadcms/ui/icons/DragHandle';
import { useConfig } from '@payloadcms/ui/providers/Config';
import { useListInfo } from '@payloadcms/ui/providers/ListInfo';
import { useLocale } from '@payloadcms/ui/providers/Locale';
import { useTranslation } from '@payloadcms/ui/providers/Translation';
import type { PaginatedDocs } from 'payload/database';
import React, { useCallback, useEffect, useState } from 'react';

import { saveChanges } from '../../handlers/saveChanges.client';
import { Dialog } from '../Dialog';

type Doc = {
  docOrder: number;
  id: number | string;
  modifiedFrom?: number;
  modifiedTo?: number;
} & Record<string, unknown>;

const CollectionDocsOrderContent = () => {
  const { collections, routes } = useConfig();

  const { t } = useTranslation();

  const { code: locale } = useLocale();

  const { collectionSlug } = useListInfo();

  const limit = 25;

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [data, setData] = useState<{
    docs: Doc[];
    hasNextPage: boolean;
    isLoading: boolean;
    loadedPages: number;
    totalDocs: number;
  }>({
    docs: [],
    hasNextPage: false,
    isLoading: true,
    loadedPages: 0,
    totalDocs: 0,
  });

  const hasSave = data.docs.some(
    (doc) => typeof doc.modifiedTo === 'number' && doc.modifiedTo !== doc.docOrder,
  );

  const sort = `sort=${sortOrder === 'desc' ? '-' : ''}docOrder`;

  const getInitalData = useCallback(async () => {
    const res = await fetch(
      `${routes.api}/${collectionSlug}?${sort}&limit=${limit}&locale=${locale}&depth=0`,
    );

    const { docs, hasNextPage, totalDocs } = await res.json();

    return setData({
      docs,
      hasNextPage,
      isLoading: false,
      loadedPages: 1,
      totalDocs,
    });
  }, [collectionSlug, locale, routes, sort]);

  useEffect(() => {
    if (collectionSlug) getInitalData();
  }, [getInitalData, collectionSlug]);

  const collectionConfig = collections.find((collection) => collection.slug === collectionSlug);

  if (!collectionConfig) return null;

  const useAsTitle = collectionConfig.admin.useAsTitle;

  const moveRow = (moveFromIndex: number, moveToIndex: number) => {
    setData((prev) => {
      const prevDocs = [...prev.docs];

      const newDocs = [...prev.docs];

      const [movedItem] = newDocs.splice(moveFromIndex, 1);

      newDocs.splice(moveToIndex, 0, movedItem);

      return {
        ...prev,
        docs: newDocs.map((doc, index) => {
          if (prevDocs[index].id !== doc.id) {
            return {
              ...doc,
              modifiedTo: prevDocs[index].modifiedTo ?? prevDocs[index].docOrder,
            };
          }

          return doc;
        }),
      };
    });
  };

  const save = async () => {
    const modifiedDocsData = data.docs
      .filter((doc) => typeof doc.modifiedTo === 'number' && doc.modifiedTo !== doc.docOrder)
      .map((doc) => ({
        id: doc.id,
        modifiedTo: doc.modifiedTo,
      }));

    if (!collectionSlug || !modifiedDocsData) return;

    const { success } = await saveChanges({
      api: routes.api,
      args: {
        collection: collectionSlug,
        docs: modifiedDocsData as { id: number | string; modifiedTo: number }[],
      },
    });

    if (success) {
      setData((prev) => ({ ...prev, isLoading: true }));
      await getInitalData();
      toast.success(t('pluginCollectionsDocsOrder:success'), {
        position: 'bottom-center',
      });
    } else {
      toast.success(t('pluginCollectionsDocsOrder:error'), {
        position: 'bottom-center',
      });
    }
    // toast.error(t("pluginCollectionsDocsOrder:error"), {
    //   position: "bottom-center",
  };

  const loadMore = () => {
    setData((prev) => ({ ...prev, isLoading: true }));

    return fetch(
      `${routes.api}/${collectionSlug}?${sort}&limit=${limit}&page=${data.loadedPages + 1}&depth=0&locale=${locale}`,
    )
      .then((res) => res.json())
      .then(({ docs, hasNextPage }: PaginatedDocs<Doc>) =>
        setData((prev) => ({
          docs: [...prev.docs, ...docs],
          hasNextPage,
          isLoading: false,
          loadedPages: prev.loadedPages + 1,
          totalDocs: prev.totalDocs,
        })),
      );
  };

  const handleSortOrderChange = (order: 'asc' | 'desc') => {
    setSortOrder(order);
    setData((prev) => ({ ...prev, isLoading: true }));
  };

  return (
    <div className='collection-docs-order-content'>
      <div className='radio'>
        <Radio
          id='asc'
          isSelected={sortOrder === 'asc'}
          onChange={() => handleSortOrderChange('asc')}
          option={{
            label: t('pluginCollectionsDocsOrder:asc'),
            value: 'asc',
          }}
          path='asc'
        />
        <Radio
          id='desc'
          isSelected={sortOrder === 'desc'}
          onChange={() => handleSortOrderChange('desc')}
          option={{
            label: t('pluginCollectionsDocsOrder:desc'),
            value: 'desc',
          }}
          path='desc'
        />
      </div>
      <DraggableSortable
        className='order-list'
        ids={data.docs.map((doc) => String(doc.id))}
        onDragEnd={({ moveFromIndex, moveToIndex }) => moveRow(moveFromIndex, moveToIndex)}
      >
        {data.docs.map((doc) => (
          <DraggableSortableItem disabled={false} id={String(doc.id)} key={doc.id}>
            {(props) => {
              return (
                <div
                  className='order-item'
                  ref={props.setNodeRef}
                  style={{ transform: props.transform }}
                >
                  <div
                    {...props.attributes}
                    {...props.listeners}
                    className='order-drag'
                    role='button'
                  >
                    <DragHandle />
                  </div>
                  <a
                    href={`${routes.admin}/collections/${collectionSlug}/${doc.id}`}
                    target='_blank'
                  >
                    {doc.docOrder}
                    {doc.modifiedTo && doc.modifiedTo !== doc.docOrder && ` - ${doc.modifiedTo}`}
                    {' - '}
                    {doc[useAsTitle] as string}
                  </a>
                </div>
              );
            }}
          </DraggableSortableItem>
        ))}
      </DraggableSortable>
      <div className='order-buttons'>
        {data.isLoading
          ? 'Loading'
          : `${t('pluginCollectionsDocsOrder:loaded')} ${data.docs.length}/${data.totalDocs}`}
        {hasSave && <Button onClick={() => save()}>{t('pluginCollectionsDocsOrder:save')}</Button>}
        {data.hasNextPage && (
          <Button onClick={loadMore}>{t('pluginCollectionsDocsOrder:loadMore')}</Button>
        )}
      </div>
    </div>
  );
};

export const CollectionDocsOrderButton = () => {
  const { t } = useTranslation();

  // const params = useParams();

  // console.log(params);

  return (
    <div className='gutter--left gutter--right collection-docs-order'>
      <Dialog
        trigger={<button style={{ margin: 0 }}>{t('pluginCollectionsDocsOrder:sortItems')}</button>}
      >
        <CollectionDocsOrderContent />
        {/* <ToastContainer /> */}
      </Dialog>
    </div>
  );
};
