import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { TbDragDrop } from "react-icons/tb";
import { MdDateRange } from "react-icons/md";
import useStore from '../../Utils/Zustand/UseStore';
import { MdMenuOpen } from "react-icons/md";
import { supabase } from '../../Utils/supabase/supabaseClient';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import IsLoggedIn from '../../Utils/IsLoggedIn';
import { TbSubtask } from "react-icons/tb";

type ItemsType = {
  id: UniqueIdentifier;
  title: string;
  priority: string,
  type: any,
  start_work: string,
  deadline: string | undefined,
  assigned_to: string;
  isAssigned: boolean;
  subTasksLength: number;
};

interface invitedEmails {
  username: string;
  email: string;
  uid: string;
}

interface updatedAt {
  date: string;
  username: string;
  email: string;
  uid: string;
  itemMoved: string
}


interface tasksType {
  title: string;
  created_at: number;
  created_by: string;
  priority: string;
  type: string;
  start_work: string;
  deadline: string;
  assigned_to: string; //uid basis
}

interface boardsType {
  title: string;
  titleColor: string; //hex
  created_at: number;
  board_uid: string;
  created_by: string;
  tasks: tasksType[]
}


interface dataType {
  description: string;
  id: number;
  created_at: number;
  name: string;
  created_by: string;
  deadline: number;
  is_shared: string;
  invited_emails: null | invitedEmails[];
  updated_at: null | updatedAt[];
  is_favorite: boolean;
  boards: boardsType[]
}


const Items = ({ id, title, start_work, deadline, type, isAssigned, assigned_to, subTasksLength }: ItemsType) => {
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

  function determineTypeColor(type: string): string {
    switch (type) {
      case "Future Enhancement":
        return '#3498db'; // Blue
      case "Bug":
        return '#e74c3c'; // Red
      case "Research":
        return '#9b59b6'; // Purple
      case "Maintenance":
        return '#e67e22'; // Orange
      case "Improvement":
        return '#f1c40f'; // Yellow
      case "Urgent":
        return '#e74c3c'; // Dark Red
      default:
        return '#2ecc71'; // Green for any unknown types
    }
  }
  const { setSettingsTask }: any = useStore()
  const params = useParams()
  const [_, setFetchedData] = useState<boardsType[] | null>(null);
  const [defaulData, setDefaultData] = useState<dataType[] | null>(null);
  const [user]:any = IsLoggedIn()


  useEffect(() => {
    if (user) {
      getProjects()
    }
  }, [user])



  async function getProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('created_at', params?.time)

      if (data) {
        setDefaultData(data)
        setFetchedData(data[0]?.boards)
      }


      if (error) {
        return console.error('Error fetching data:', error);
      }

    } catch (err) {

      console.log(err);
    }
  }


  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={clsx(
        'overflow-hidden flex bg-[#222222] border-[#535353] border-[1px]  shadow-md rounded-xl w-full text-white  hover:bg-[#222222] cursor-pointer',
        isDragging && 'opacity-50 border-dashed border-custom',
      )}
    >
      <div className='flex items-start gap-2 w-full'>
        <div style={{ backgroundColor: determineTypeColor(type) }}
          className={`w-[2px] h-full`}>

        </div>

        <div className="flex items-start justify-between gap-3 px-2 py-4  w-full">
         <div className='flex gap-2 items-start flex-col-reverse'>
      {
        subTasksLength > 0 &&
        <div className='flex gap-2 items-center text-[10px] border-[#535353] border-[1px] p-1 rounded-md px-2 bg-[#111]'>
        <TbSubtask />  {subTasksLength}
         </div>
      }
          <div className='flex gap-1 flex-col'>
            <div className='break-all'>{title}</div>
            {
              start_work &&
              <div className='text-sm text-[#888] flex items-center gap-[2px]'>
                <MdDateRange />   {deadline}
              </div>
            }
            {
              isDragging ?
                "Dragging" :
                <div className='break-all text-sm text-[#888] '>Assigned for:
                  {" "}   <span className={`${assigned_to === user?.email && 'underline text-green-700'}`}>{assigned_to === user?.email && "(me)"}         {" "}   {assigned_to && assigned_to ? (assigned_to.length > 15 ? assigned_to.slice(0, 15) + "..." : assigned_to) : "Everyone"}</span> {" "}

                </div>
            }
          </div>
         </div>
          <div className='flex gap-3 '>
            {

              (isAssigned && (defaulData && defaulData[0]?.is_shared != "public" || "private") || defaulData && defaulData[0]?.created_by === user?.id) &&
              // (defaulData && defaulData[0]?.is_shared === "public") ||
              // (defaulData && defaulData[0]?.is_shared === "private" && defaulData[0]?.created_by === user?.id)  &&


              <button
                className="p-2 bg-[#111111] outline-none  border-[#535353] hover:bg-[#222222] border-[1px]  text-md touchedPage rounded-lg shadow-lg hover:shadow-xl"
                {...listeners}
              >
                <TbDragDrop />
                {isDragging}
              </button>

            }
            <button
              onClick={() => { setSettingsTask(id) }}
              className="p-2 text-md rounded-lg bg-[#111111] outline-none  border-[#535353] border-[1px]  shadow-lg hover:bg-[#222222]"
            >
              <MdMenuOpen />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Items;