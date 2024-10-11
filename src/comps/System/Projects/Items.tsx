import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { TbDragDrop } from "react-icons/tb";

type ItemsType = {
  id: UniqueIdentifier;
  title: string;
};

const Items = ({ id, title }: ItemsType) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: 'item',
    },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        'px-2 py-4 bg-[#222222] border-[#535353] border-[1px]  shadow-md rounded-xl w-full text-white  hover:bg-[#222222] cursor-pointer',
        isDragging && 'opacity-50 border-dashed border-custom',
      )}
    >
      <div className="flex items-center justify-between">
        {title}
        <div className='flex gap-3'>
          <button
            className="p-2 bg-[#111111] outline-none  border-[#535353] border-[1px]  text-md touchedPage rounded-lg shadow-lg hover:shadow-xl"
            {...listeners}
          >
            <TbDragDrop/>
          </button>
          <button
            className="p-2 text-xs rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  shadow-lg hover:shadow-xl"
            {...listeners}
          >
            Actions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Items;