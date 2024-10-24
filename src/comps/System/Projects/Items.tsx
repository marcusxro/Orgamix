import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { TbDragDrop } from "react-icons/tb";
import { MdDateRange } from "react-icons/md";
import useStore from '../../../Zustand/UseStore';
import { MdMenuOpen } from "react-icons/md";
import { supabase } from '../../../supabase/supabaseClient';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import IsLoggedIn from '../../../firebase/IsLoggedIn';

type ItemsType = {
  id: UniqueIdentifier;
  title: string;
  priority: string,
  type: any,
  start_work: string,
  deadline: string | undefined,
  assigned_to: string;
  isAssigned: boolean
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
interface accountType {
  userid: string;
  username: string;
  password: string;
  email: string;
  id: number;
  fullname: string;
}

const Items = ({ id, title, start_work, deadline, type, isAssigned, assigned_to }: ItemsType) => {
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
  const [fetchedData, setFetchedData] = useState<boardsType[] | null>(null);
  const [defaulData, setDefaultData] = useState<dataType[] | null>(null);
  const [user] = IsLoggedIn()


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

        <div className="flex items-center justify-between gap-3 px-2 py-4  w-full">
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
         {" "}   <span className={`${assigned_to === user?.email && 'underline text-green-700'}`}>{assigned_to === user?.email && "(me)"}         {" "}   {assigned_to && assigned_to ? (assigned_to.length > 15 ? assigned_to.slice(0,15) + "..." : assigned_to): "Everyone"}</span> {" "}
          
            </div>
          }
          </div>
          <div className='flex gap-3 '>
            {

              (isAssigned && (defaulData && defaulData[0]?.is_shared != "public" || "private") || defaulData && defaulData[0]?.created_by === user?.uid) &&
              // (defaulData && defaulData[0]?.is_shared === "public") ||
              // (defaulData && defaulData[0]?.is_shared === "private" && defaulData[0]?.created_by === user?.uid)  &&


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