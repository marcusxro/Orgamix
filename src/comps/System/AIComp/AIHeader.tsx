import React, { useEffect, useState } from 'react';
import { FaInfoCircle } from "react-icons/fa";
import { CiShare1 } from "react-icons/ci";
import { RiMenu4Line } from "react-icons/ri";
import AiMenuModal from './AiMenuModal';
import { useParams } from 'react-router-dom';
import useStore from '../../../Zustand/UseStore';
import AIShareModal from './AIShareModal';

const AIHeader: React.FC = () => {
    const { isHidden, setIsHidden } = useStore()
    const params = useParams()
    const { showShare, setShowShare }: any = useStore()


    return (
        <>

            {
                <AiMenuModal location={params?.time as string} />
            }

            {
                showShare &&
                <AIShareModal />
            }

            {/* Conditionally render the sidebar toggle button */}
            <div className="w-full flex items-center gap-5 justify-between xl:px-5">
                <div className='flex gap-5 items-center'>
                    <div
                        onClick={() => { setIsHidden(!isHidden) }}
                        className='text-xl md:hidden cursor-pointer hover:text-[#888]'>
                        <RiMenu4Line />
                    </div>
                    <div className='font-bold text-sm'>
                        ORGAMIX
                    </div>

                </div>
                <div className='flex gap-5 items-center'>
                    <div
                        onClick={() => { setShowShare(true) }}
                        className='border-[1px] flex gap-2 items-center border-[#535353] px-4 py-1 rounded-2xl bg-[#191919] cursor-pointer hover:bg-[#222]'>
                        <span className='text-lg font-bold flex items-center mt-[1px]'>
                            <CiShare1 />
                        </span>
                        Share
                    </div>
                    <div className='border-[1px] flex gap-2 items-center border-[#535353] p-2 text-[#888] rounded-2xl bg-[#191919] cursor-pointer hover:bg-[#222]'>

                        <FaInfoCircle />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIHeader;
