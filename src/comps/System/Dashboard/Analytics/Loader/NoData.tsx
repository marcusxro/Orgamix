import React from 'react'
import { CiFileOff } from "react-icons/ci";

interface NoDataProps {
    propsText: string;
}
const NoData: React.FC<NoDataProps> = ({ propsText }) => {
    return (
        <div className='text-sm text-left text-[#888] flex items-center gap-2'>
            <CiFileOff /> {propsText}
        </div>
    )
}

export default NoData
