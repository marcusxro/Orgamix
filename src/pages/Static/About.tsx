import React from 'react'
import Header from '../../comps/Header'
import { useNavigate } from 'react-router-dom'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import Footer from '../../comps/Footer'
import projcetImage from '../../assets/ProjectImages/Untitled design (4).png'
import Marquee from 'react-fast-marquee'
import layerImg from '../../assets/Art/LayerImg.png'
import Menu from '../../comps/Menu'
import useStore from '../../Zustand/UseStore'



const About: React.FC = () => {

    const nav = useNavigate()
    const { showMenu }: any = useStore()
    return (
        <div className='relative invertedSelection'>
            {
                showMenu &&
                <Menu />

            }

            <Header />
            <MetaEditor
                title='Orgamix | About'
                description='Orgamix is a software created by a solo engineer to raise funds through ads, with the earnings directed to those in need, like storm victims and other affected communities.'
                keywords="Orgamix, productivity software, fundraising through ads, disaster relief, community support, charity, storm victims, ad revenue for good"
            />
            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#222] via-transparent to-transparent z-10 opacity-80"></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-l from-[#222] via-transparent to-transparent z-10 opacity-80"></div>

            <div className='px-5 z-[500] relative'>

                <div className='w-full max-w-[1200px] mx-auto mt-[4rem]'>
                    <div className='flex flex-col gap-5  items-center justify-center'>
                        <div className='text-[3rem] font-bold text-center reducedHeight'>
                            About Orgamix
                        </div>
                        <div className='text-sm text-[#888] w-full max-w-[800px] text-center'>
                            Orgamix is a software created by a solo engineer to raise funds through ads, with the earnings directed to those in need, like storm victims and other affected communities.
                        </div>
                        <div className="w-full h-0 pt-[56.25%] mt-4 bg-black rounded-lg relative">
                            <div className="absolute inset-0">
                                sds
                            </div>
                        </div>
                    </div>

                    <div className="mt-[8%] border-[1px] border-[#535353] flex flex-col md:flex-row items-center rounded-lg overflow-hidden">
                        <div className="w-full pt-[50%] h-[300px] overflow-auto sm:pt-[36.25%] bg-[#111] relative">
                            <div className="absolute flex inset-0 items-center justify-center p-5">
                                <div className='flex flex-col gap-5 items-start'>
                                    <div className='text-xl font-bold'>
                                        Orgamix: Empowering Future Productivity
                                    </div>
                                    <div className='text-sm text-[#888] w-full max-w-[300px]'>
                                        Our goal is to deliver tools that enhance productivity and drive meaningful outcomes for everyone, maximizing positive impact nationwide.
                                    </div>

                                    <div
                                        onClick={() => { nav('/sign-up') }}
                                        className='bg-[#ececec] text-sm hover:bg-[#222] hover:text-[#ececec] text-[#111] p-2 rounded-md px-5 cursor-pointer border-[1px] border-[#545454]'>
                                        Join Orgamix
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-auto pt-[50%] sm:pt-[36.25%] bg-[#111] border-l-0 md:border-l-[1px] border-l-[#535353] relative overflow-hidden">
                            <div className="absolute inset-0">
                                <div>
                                    <Marquee autoFill>
                                        <img src={projcetImage} alt="" className='w-full h-full object-cover' />
                                        <img src={projcetImage} alt="" className='w-full h-full object-cover' />
                                    </Marquee>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className='mt-[8%]'>
                        <div className='text-2xl text-[#ececec] font-semibold w-full max-w-[800px] text-center mx-auto'>
                            We are developing tools that empower people and communities, and our mission will be complete when our work helps others achieve their goals through collaboration and innovation.
                        </div>
                    </div>

                    <div className='mt-[8%]'>
                        <div className="w-full h-0 pt-[56.25%] mt-4 bg-black rounded-lg relative">
                            <div className="absolute inset-0">
                                sd
                            </div>
                        </div>
                    </div>


                    <div className="mt-[8%] flex items-center justify-center">
                        <div className='w-full max-w-[500px] flex items-center justify-center gap-4 flex-col'>
                            <div className="text-xl font-semibold">
                                Join Orgamix
                            </div>
                            <div className="text-center text-[#888]">
                                We’re looking for skilled developers eager to make an impact by volunteering with us.
                            </div>

                            <div className='px-8 cursor-pointer border-[1px] border-[#545454]  hover:bg-[#333] hover:text-[#ececec] py-2 text-md text-[#111] rounded-lg bg-[#ececec]'>
                                Contact
                            </div>
                        </div>
                    </div>


                    <div className='mt-[8%]'>
                        <div className="w-full h-0 pt-[56.25%] mt-4 bg-black rounded-lg relative">
                            <div className="absolute inset-0">
                                sd
                            </div>
                        </div>
                    </div>
                    <div className="mt-[8%]  border-[1px] border-[#535353]  flex flex-col md:flex-row items-center rounded-lg overflow-hidden">
                        <div className="w-full   pt-[100%]  h-auto  sm:pt-[36.25%] bg-[#111] relative  overflow-hidden">
                            <div className="absolute flex inset-0 items-center justify-center p-5">
                                <div className=' flex flex-col gap-5 items-start'>
                                    <div className='text-xl font-bold'>
                                        Our Structure
                                    </div>
                                    <div className='text-sm text-[#888] w-full max-w-[300px]'>
                                        Orgamix operates under a nonprofit foundation, supported by a capped-profit approach that emphasizes responsible growth. This structure allows us to reinvest and distribute earnings from our work, aiming to amplify positive social and economic outcomes while ensuring that technology’s benefits reach those who need it most.                                    </div>

                                    <div
                                        onClick={() => { nav('/sign-up') }}
                                        className='bg-[#ececec] text-sm hover:bg-[#222] hover:text-[#ececec] text-[#111] p-2 rounded-md px-5 cursor-pointer border-[1px] border-[#545454]'>
                                        Join Orgamix
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-0 pt-[36.25%] bg-[#555]  relative  overflow-hidden">

                            <div className="absolute inset-0">
                                <div className='w-full h-full bg-red-400'>
                                    <img src={layerImg} alt="" className='w-full h-full object-fill scale-[1.2]' />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className='mt-[8%] font-semibold text-center text-2xl items-center justify-center flex'>
                        Let's shape the future together
                    </div>


                </div>
            </div>
            <div className='z-[2000] relative mt-[8%]'>
                <Footer />
            </div>
        </div>
    )
}

export default About
