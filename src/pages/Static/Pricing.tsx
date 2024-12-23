import React from 'react'
import Header from '../../comps/Header'
import Menu from '../../comps/Menu'
import { useNavigate } from 'react-router-dom'
import useStore from '../../Zustand/UseStore'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import Footer from '../../comps/Footer'
import { FaCheck } from "react-icons/fa";
import PricingFaqs from '../../comps/FaqsComps/FaqsObj'
import { CiCirclePlus } from "react-icons/ci";
import { CiCircleMinus } from "react-icons/ci";
import { MdArrowOutward } from "react-icons/md";


const Pricing: React.FC = () => {

    const nav = useNavigate()
    const { showMenu }: any = useStore()


    const [clickedIds, setClickedIds] = React.useState<string[] | null>(null)

    function showDescription(paramsID: string) {
        console.log(paramsID)
        const isFound = clickedIds?.filter((i: any) => i.title === paramsID)

        if (isFound != null && isFound.length > 0) {
            const newClickedIds: string[] | undefined = clickedIds?.filter((i: any) => i.title !== paramsID)
            setClickedIds(newClickedIds ?? null)
        } else {
            setClickedIds((prevState: any) => {
                if (prevState) {
                    return [...prevState, { title: paramsID }];
                } else {
                    return [{ title: paramsID }];
                }
            })
        }

        console.log(clickedIds)
    }


    return (
        <div className='relative invertedSelection'>
            {
                showMenu &&
                <Menu />

            }

            <Header />

            <MetaEditor
                title='Orgamix | Pricing'
                description='Pricing for our services'
                keywords='Pricing, Services, Cost, Plans'
            />

            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#222] via-transparent to-transparent z-10 opacity-80"></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-l from-[#222] via-transparent to-transparent z-10 opacity-80"></div>

            <div className='px-5 min-h-[100vh] z-[20000]'>

                <div className='w-full max-w-[1200px] mx-auto mt-[4rem] z-[2000] relative'>
                    <div className='flex flex-col text-center justify-center items-center'>
                        <div className='text-[2rem] lg:text-[3rem] font-bold'>
                            Choose Your Perfect Plan
                        </div>
                        <div className='text-sm text-[#888] mt-2'>
                            Select the plan that matches your goals and boosts your productivity.
                        </div>
                    </div>

                    <div className='mt-[5rem] grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-5 w-full '>

                        <div className='bg-[#333] w-full items-start flex flex-col p-5 rounded-lg text-center border-[1px] border-[#535353]'>
                            <div className='text-2xl font-bold'>
                                FREE
                            </div>
                            <div className='text-[#888] mt-2'>
                                Perfect for users who are just starting out
                            </div>
                            <div
                                onClick={() => { nav('/sign-in') }}
                                className='bg-green-800 hover:bg-green-900 border-[1px] border-[#888] w-full p-3 rounded-md mt-3 cursor-pointer'>
                                Start for Free
                            </div>

                            <div className='mt-[3rem] flex items-end gap-2'>
                                <div className='text-[3rem] bold'>
                                    ₱0
                                </div>
                                <div className='mb-2 text-[#888]'>
                                    / month
                                </div>
                            </div>

                            <div className='my-[2rem] bg-[#535353] w-full h-[1px]'>

                            </div>

                            <div className='flex flex-col gap-8 mt-2 w-full items-start pb-5'>
                                <div className='text-[#888] text-sm'>Get started with:</div>
                                <div className='flex flex-col gap-3 mt-2 w-full items-start'>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>   10 Tasks
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     5 Goals
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>    5 Notes
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>    5 Projects
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     10 free AI conversation
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Deadlines page
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Dashboard page
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>      Notifications
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>  Collaborative
                                    </div>
                                </div>
                            </div>
                            <div className='my-[2rem] bg-[#535353] w-full h-[1px]'>

                            </div>
                            <div className='mt-auto text-[#888] text-sm'>
                                Free plan is applicable for personal use only
                            </div>
                        </div>

                        <div className='bg-[#333] w-full items-start flex flex-col p-5 rounded-lg text-center border-[1px] border-[#535353]'>
                            <div className='text-2xl font-bold flex items-center gap-3'>
                                Student Plan

                                <div className='text-[10px] font-normal border-[1px] border-[#888] text-[#edecec] bg-[#535353] px-3 rounded-md'>
                                    Most Popular
                                </div>
                            </div>
                            <div className='text-[#888] mt-2'>
                                Plan for students who need more features
                            </div>
                            <div
                                onClick={() => { nav('/sign-in') }}
                                className='bg-green-800 hover:bg-green-900  border-[1px] border-[#888] w-full p-3 rounded-md mt-3 cursor-pointer'>
                                Upgrade now

                            </div>

                            <div className='mt-[3rem] flex items-end gap-2'>
                                <div className='text-[3rem] bold'>
                                    ₱50
                                </div>
                                <div className='mb-2 text-[#888]'>
                                    / month
                                </div>
                            </div>

                            <div className='my-[2rem] bg-[#535353] w-full h-[1px]'>

                            </div>

                            <div className='flex flex-col gap-8 mt-2 w-full items-start'>
                                <div className='text-[#888] text-sm'>Get started with:</div>
                                <div className='flex flex-col gap-3 mt-2 w-full items-start'>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>   30 Tasks
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     20 Goals
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>    30 Notes
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>    15 Projects
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     25 AI conversation
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     templates in goals unlocked
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Deadlines page
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Pomodoro
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Dashboard page
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>      Notifications
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>  Collaborative
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-[#333] w-full items-start flex flex-col p-5 rounded-lg text-center border-[1px] border-[#535353]'>
                            <div className='text-2xl font-bold flex items-center gap-3'>
                                Team Plan

                                <div className='text-[10px] font-normal border-[1px] border-[#888] text-[#edecec] bg-[#535353] px-3 rounded-md'>
                                    Recommended
                                </div>
                            </div>
                            <div className='text-[#888] mt-2'>
                                plan for teams who need more features
                            </div>
                            <div
                                onClick={() => { nav('/sign-in') }}
                                className='bg-green-800 hover:bg-green-900  border-[1px] border-[#888] w-full p-3 rounded-md mt-3 cursor-pointer'>
                                Upgrade now

                            </div>

                            <div className='mt-[3rem] flex items-end gap-2'>
                                <div className='text-[3rem] bold'>
                                    ₱100
                                </div>
                                <div className='mb-2 text-[#888]'>
                                    / month
                                </div>
                            </div>

                            <div className='my-[2rem] bg-[#535353] w-full h-[1px]'>

                            </div>

                            <div className='flex flex-col gap-8 mt-2 w-full items-start'>
                                <div className='text-[#888] text-sm'>Get started with:</div>
                                <div className='flex flex-col gap-3 mt-2 w-full items-start'>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>   50 Tasks
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     35 Goals
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>    35 Notes
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>    30 Projects
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     50 AI conversation
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     templates in goals unlocked
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Deadlines page
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Pomodoro
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>     Dashboard page
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>      Notifications
                                    </div>
                                    <div className='flex gap-2 items-center'>
                                        <span className='text-md text-green-500'><FaCheck /></span>  Collaborative
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>


                    <div className='mt-[5rem] border-t-[1px] border-t-[#535353] pt-[5rem]'>
                        <div className='text-[3rem] font-bold'>
                            FAQS
                        </div>
                        <div className='text-sm text-[#888] mt-2'>
                            Here are some frequently asked questions about our pricing plans.
                        </div>

                        <div className='mt-[3rem]'>
                            {
                                PricingFaqs.map((faq, index) => (
                                    <div
                                        onClick={() => { showDescription(faq.title) }}
                                        className='bg-[#191919] flex items-start gap-3 cursor-pointer hover:bg-[#222] p-5 rounded-xl border-[1px] border-[#535353] mt-2' key={index}>

                                        {
                                            clickedIds != null && clickedIds?.filter((i: any) => i.title === faq.title).length > 0 ?
                                                <div className='text-[#fa5e3e] mt-2'>
                                                    <div className='text-3xl'>
                                                        <CiCircleMinus />
                                                    </div>
                                                </div>
                                                :
                                                <div className='text-3xl'>
                                                    <CiCirclePlus />

                                                </div>
                                        }

                                        <div>
                                            <div className='text-lg font-bold'>
                                                {faq.title}
                                            </div>
                                            {
                                                clickedIds != null && clickedIds?.filter((i: any) => i.title === faq.title).length > 0 ?
                                                    <div className='text-[#888] mt-2'>
                                                        {faq.description}
                                                    </div>
                                                    : null
                                            }
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>


                    <div className='mt-[5rem] border-t-[1px] border-t-[#535353] pt-[5rem]'>
                        <div className='flex gap-3 items-center justify-center w-full flex-col text-center'>
                            <div className='text-[3rem] font-bold'>Need More Help?</div>
                            <p className='text-sm text-[#888] w-full max-w-[500px]'>If you have any questions or need assistance, we’ve got you covered. Check out these helpful articles to get more insight or reach out to our support team.</p>
                        </div>


                        <div className='mt-[3rem] flex flex-col md:flex-row gap-4'>

                            <div className='bg-[#333] w-full p-5 rounded-md border-[1px] flex-start justify-start flex flex-col border-[#535353]'>
                                <div className='font-bold text-[1.3rem]'>
                                    How to Manage Your Subscription
                                </div>
                                <div className='text-[#888] text-sm my-1'>
                                    Learn how to upgrade, downgrade, or cancel your subscription. This guide will walk you through the process step by step to ensure you’re always in control of your plan.
                                </div>

                                <div className='flex items-start mt-auto'>
                                    <div className='mt-7 hover:bg-[#222] bg-[#191919] border-[1px] border-[#535353] p-3 rounded-md cursor-pointer flex items-center gap-3'>
                                        Read Article <span><MdArrowOutward /></span>
                                    </div>
                                </div>
                            </div>

                            <div className='bg-[#333] w-full p-5 rounded-md border-[1px] flex-start flex flex-col border-[#535353]'>
                                <div className='font-bold text-[1.3rem]'>
                                    Troubleshooting Common Issues
                                </div>
                                <div className='text-[#888] text-sm my-1'>
                                    Encountering an issue? From payment problems to login issues, this article covers the most common problems and how to resolve them quickly.                                </div>

                                <div className='flex items-start mt-auto'>
                                    <div className='mt-7 hover:bg-[#222] bg-[#191919] border-[1px] border-[#535353] p-3 rounded-md cursor-pointer flex items-center gap-3'>
                                        Read Article <span><MdArrowOutward /></span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className='mt-[5rem] text-center text-lg'>
                            If you still need help, feel free to contact our support team <span className='font-bold'>orgamixteam@gmail.com</span>—we’re here to assist you!
                        </div>
                    </div>
                </div>

            </div>

            <div className='z-[2000] relative mt-[8%]'>
                <Footer />
            </div>
        </div>
    )
}

export default Pricing
