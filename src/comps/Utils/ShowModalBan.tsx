import React from 'react'
import useStore from '../../Zustand/UseStore'
import BannedUser from '../System/BannedUser'

const ShowModalBan:React.FC = () => {
    const {isBanned}:any = useStore()

  return (
    <>
      {
        isBanned &&  <BannedUser />
      }
    </>
  )
}

export default ShowModalBan
