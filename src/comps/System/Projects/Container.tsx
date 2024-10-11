import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { Button } from '../Projects/Button';
import { UniqueIdentifier } from '@dnd-kit/core';
import { TbDragDrop } from "react-icons/tb";


interface ContainerProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  title?: string;
  itemLength: number;
  description?: string;
  titleColor: string;
  onAddItem?: () => void;
}

const Container = ({
  id,
  children,
  title,
  description,
  onAddItem,
  titleColor,
  itemLength
}: ContainerProps) => {
  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: 'container',
    },
  });
  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        'w-full h-full max-h-[500px] overflow-auto bg-[#313131]  border-[#535353] border-[1px] text-white rounded-xl flex flex-col gap-y-4',
        isDragging && 'opacity-50 border-dashed border-custom',
      )}
    >
      <div 
       style={{backgroundColor: titleColor}}
      className="flex items-center justify-between p-3">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-white text-md"><span className='text-[#888] mr-3'>({itemLength})</span>
            <span>{title}</span>
          </h1>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className='gap-2 flex items-center'>
          <button
            className='text-md px-3 py-[11px] touchedPage rounded-lg bg-[#222222] text-white hover:bg-[#353535]   border-[#535353] border-[1px]'

            {...listeners}
          >
            <TbDragDrop />
          </button>
          <Button
          variant={"addItem"}
           onClick={onAddItem}>
            +
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Container;