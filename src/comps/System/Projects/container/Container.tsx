import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { Button } from '../Projects/Button';
import { UniqueIdentifier } from '@dnd-kit/core';
import { TbDragDrop } from "react-icons/tb";
import { IoSettingsOutline } from "react-icons/io5";
import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import useStore from '../../Utils/Zustand/UseStore';



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
  const { setSettingsBoard }:any = useStore()

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
      {isDragging}
      <div
        style={{ backgroundColor: titleColor }}
        className="flex items-center gap-3 justify-between p-3">

        <div className="flex flex-col gap-y-1">
          <h1 className="text-white text-md"><span className='text-[#888] mr-3'>({itemLength})</span>
            <span className='text-white mix-blend-difference break-all'>{title}</span>
          </h1>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>

        <div className='gap-2 flex items-center'>
          <button
            data-tooltip-id={`drop-${id}`}
            className='text-md px-3 py-[11px]  rounded-lg bg-[#222222] text-white hover:bg-[#353535]   border-[#535353] border-[1px]'

            {...listeners}
          >

            <ReactTooltip
              id={`drop-${id}`}
              place="bottom"
              variant="dark"
              className='rounded-lg border-[#535353] border-[1px]'
              content="Drag item"
            />

            <TbDragDrop />
          </button>
          <Button
            data-tooltip-id={`add-${id}`}
            variant={"addItem"}
            onClick={onAddItem}>
            +
            <ReactTooltip
              id={`add-${id}`}
              place="bottom"
              variant="dark"
              className='rounded-lg border-[#535353] border-[1px]'
              content="Add item"
            />
          </Button>
          <Button
            onClick={() => {setSettingsBoard(id)}}
            data-tooltip-id={`set-${id}`}
            variant={"addItem"}>
            <IoSettingsOutline />
            <ReactTooltip
              id={`set-${id}`}
              place="bottom"
              className='rounded-lg border-[#535353] border-[1px]'
              variant="dark"
              content="Settings"
            />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Container;