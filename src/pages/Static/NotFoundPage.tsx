import React from 'react'
import Header from '../../comps/Header'
import Footer from '../../comps/Footer'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import { useNavigate } from 'react-router-dom'

const NotFoundPage: React.FC = () => {
    const nav = useNavigate()
    return (
        <div className='relative'>
            <Header />
            <MetaEditor
                title='Orgamix | 404'
                description='The page you are looking for does not exist. Please check the URL and try again.'
                keywords="Orgamix, 404, Not found, Page, Error, URL, Check, Try, Again, Home, Documentation, About, Contact"
            />
             <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

<div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#222] via-transparent to-transparent z-10 opacity-80"></div>
<div className="absolute inset-0 w-full h-full bg-gradient-to-l from-[#222] via-transparent to-transparent z-10 opacity-80"></div>


            <div className='h-[78vh] flex items-center justify-center relative z-[500]'>
                    <div className='flex flex-col gap-2 items-center justify-center text-center'>
                        
                            <h1 className='text-9xl text-[#888] font-bold'>404</h1>
                            <h1 className='text-3xl text-[#888] font-bold'>Page not found</h1>
                            <p className='text-[#888]'>The page you are looking for does not exist. Please check the URL and try again.</p>
                        <div
                            onClick={() => { nav(-1) }}
                        className='px-5 py-1 bg-[#ececec] rounded-lg text-[#111] hover:bg-[#191919] cursor-pointer hover:text-white border-[1px] border-[#535353]'>
                            go back
                        </div>
                    </div>
            </div>
           <div className='relative z-[500]'>
           <Footer />
           </div>
        </div>
    )
}

export default NotFoundPage