import React from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'
import { useSyncDemo } from '@tldraw/sync'



const TestPage:React.FC = () => {
    const store = useSyncDemo({ roomId: 'my-unique-room-id' })


  return (
    <div className='h-screen'>
        <Tldraw  store={store} />
    </div>
  )
}

export default TestPage
