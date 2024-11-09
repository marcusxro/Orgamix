import React from 'react'
import Header from '../../comps/Header'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import Footer from '../../comps/Footer'
import { FaLocationArrow } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import useStore from '../../Zustand/UseStore';
import Menu from '../../comps/Menu';

const Contact: React.FC = () => {

    const handleEmailClick = () => {
        window.location.href = 'mailto:orgamixteam@gmail.com'; // Triggers email client with the provided email
    };
    const { showMenu }: any = useStore()


    return (
        <div className='relative'>
              {
                showMenu &&
                <Menu />

            }
            <Header />
            <MetaEditor
                title='Orgamix | Contact'
                description='Contact us for any queries or feedback.'
                keywords="Orgamix, productivity software, fundraising through ads, disaster relief, community support, charity, storm victims, ad revenue for good"
            />
            <div className="absolute inset-0 w-full h-full bg-transparent z-10 opacity-40 grid-overlay"></div>

            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#222] via-transparent to-transparent z-10 opacity-80"></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-l from-[#222] via-transparent to-transparent z-10 opacity-80"></div>



            <div className='mx-auto w-full max-w-[1200px] min-h-[100vh] z-30 relative p-3'>

                <div className='text-[2rem] md:text-[3rem] font-bold text-center mt-[4rem] reducedHeight'>
                    Questions or feedback?
                </div>
                <div className='text-sm text-[#888] w-full max-w-[800px] text-center mx-auto mt-5'>
                    Let us know your queries, feedback or any other concerns. We're here to help you out. and we'll get back to you as soon as possible.
                </div>


                <div className='mt-[4rem] w-full flex flex-col lg:flex-row gap-5'>
                    <div className='flex flex-col gap-8 w-full'>
                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>01</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <div>What's your name?</div>
                                <input
                                    className='w-full  outline-none outline border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    type="text" />
                            </div>
                        </div>


                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>02</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <div>What's your email address?</div>
                                <input
                                    className='w-full  outline-none outline border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    type="text" />
                            </div>
                        </div>

                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>01</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <div>What's your phone number?</div>
                                <input
                                    className='w-full  outline-none outline border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    type="text" />
                            </div>
                        </div>

                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>04</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <label htmlFor="reason">What’s the reason for your contact?</label>
                                <select
                                    id="reason"
                                    className='w-full  utline-none border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'>
                                    <option value="question">Question</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="collaboration">Collaboration</option>
                                </select>
                            </div>
                        </div>



                        {/* Message Input */}
                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>05</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <label htmlFor="message">How can we help or collaborate?</label>
                                <textarea
                                    id="message"
                                    className='w-full  esize-none outline-none border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    rows={4}
                                    placeholder="Type your message here..."
                                />
                            </div>
                        </div>

                        <div className='flex items-start justify-end'>
                            <div className='px-3 py-2 flex items-center gap-2 rounded-lg bg-[#111] border-[1px] border-[#535353] cursor-pointer hover:bg-[#222]'>
                                Send  <FaLocationArrow />
                            </div>
                        </div>
                    </div>


                    <div className='w-full  lg:max-w-[300px] p-5 flex flex-col gap-3 h-full min-h-[200px] bg-[#222] rounded-lg border-[1px] border-[#535353]'>
                        <div className='flex flex-col gap-2'>
                            <div className='font-semibold'>
                                Email us
                            </div>
                            <div
                                onClick={handleEmailClick}
                                className='cursor-pointer text-[#888] flex items-center gap-2'>
                                <MdEmail />
                                Orgamixteam@gmail.com
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className='font-semibold'>
                                Call us
                            </div>
                            <div
                                onClick={handleEmailClick}
                                className='cursor-pointer text-[#888] flex items-center gap-2'>
                                <FaPhoneAlt />  09625426771
                            </div>
                        </div>
                        <div className='flex gap-4 mt-5 '>
                            <div className='cursor-pointer'>

                                <FaFacebook />
                            </div>
                            <div className='cursor-pointer'>
                                <FaGithub />
                            </div>
                            <div className='cursor-pointer'>
                                <FaInstagramSquare />

                            </div>
                        </div>
                    </div>

                </div>


            </div>


            <div className='z-[500000] relative'>
                <Footer />
            </div>
        </div>
    )
}

export default Contact
