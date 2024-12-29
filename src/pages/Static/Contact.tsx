import React from 'react'
import Header from '../../comps/System/layouts/Header'
import MetaEditor from '../../comps/MetaHeader/MetaEditor'
import Footer from '../../comps/System/layouts/Footer'
import { FaLocationArrow } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaCheck, FaPhoneAlt } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import useStore from '../../comps/Utils/Zustand/UseStore';
import Menu from '../../comps/System/layouts/Menu';
import { supabase } from '../../comps/Utils/supabase/supabaseClient';
import { BiSolidError } from "react-icons/bi";
import Loader from '../../comps/Svg/Loader';
import { IoLocationSharp } from "react-icons/io5";

const Contact: React.FC = () => {

    const handleEmailClick = () => {
        window.location.href = 'mailto:orgamixteam@gmail.com'; // Triggers email client with the provided email
    };
    const { showMenu }: any = useStore()


    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [message, setMessage] = React.useState('')
    const [reason, setReason] = React.useState('')
    const [phone, setPhone] = React.useState<number | any>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)


    async function sendMessage() {
        setLoading(true)
        if (loading) return
        if(email.includes('@') === false || email.includes('.') === false){
            setError('Please enter a valid email address')
            setLoading(false)
            return
        }
        if (name === '' || email === '' || message === '' || reason === '') {
            setError('Please fill in all the fields')
            setLoading(false)

            return
        }

        try {
            const { error } = await supabase
                .from('inquiries')
                .insert({
                    name: name,
                    email: email,
                    message: message,
                    reason: reason,
                    phone_number: phone,
                    created_at: Date.now()
                })
            if (error) {
                setError('An error occurred while sending your message')
                setLoading(false)
                return
            } else {
                setName('')
                setEmail('')
                setMessage('')
                setReason('')
                setPhone('')

                setSuccess('Message sent successfully')
                setLoading(false)
                setError(null)
                setTimeout(() => {
                    setSuccess(null)
                }, 3000)
                
            }

        }
        catch (error) {
            setLoading(false)
            setError('An error occurred while sending your message')
            console.log(error)
        }
    }

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



            <div className='mx-auto w-full max-w-[1200px] min-h-[100vh] z-30 relative p-5'>

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
                                    maxLength={50}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder='John Doe'
                                    className='w-full  outline-none outline border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    type="text" />
                            </div>
                        </div>


                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>02</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <div>What's your email address?</div>
                                <input
                                    maxLength={50}
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='johndoe@gmail.com'
                                    className='w-full  outline-none outline border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    type="email" />
                            </div>
                        </div>

                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>01</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <div>What's your phone number?</div>
                                <input
                                    maxLength={11}
                                    value={phone}
                                    onChange={(e) => setPhone(parseInt(e.target.value))}
                                    placeholder='09XXXXXXXXX'
                                    className='w-full  outline-none outline border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    type="number" />
                            </div>
                        </div>

                        <div className='flex gap-4 items-start w-full'>
                            <div className='px-2 rounded-full border'>04</div>
                            <div className='flex flex-col gap-2 w-full'>
                                <label htmlFor="reason">What’s the reason for your contact?</label>
                                <select

                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    id="reason"
                                    className='w-full  utline-none border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'>
                                    <option value="">Please select</option>
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
                                    maxLength={500}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    id="message"
                                    className='w-full  esize-none outline-none border-[1px] border-[#535353] rounded-md bg-[#191919] px-3 py-3'
                                    rows={4}
                                    placeholder="Type your message here..."
                                />
                            </div>
                        </div>
                        {
                            error !== null && success === null &&
                            <div className='bg-red-500 p-3 flex items-center gap-2 break-words rounded-lg w-full max-w-[790px] ml-auto'>
                                <BiSolidError /> {error}
                            </div>
                        }
                        {
                            success !== null &&
                            <div className='bg-green-500 p-3 flex items-center gap-2 break-words rounded-lg w-full max-w-[790px] ml-auto'>
                                <FaCheck /> {success}
                            </div>
                        }

                        <div className='flex items-start justify-end'>
                            <div
                                onClick={() => { !loading && sendMessage() }}
                                className='px-3 selectionNone py-2 flex items-center gap-2 rounded-lg bg-[#111] border-[1px] border-[#535353] cursor-pointer hover:bg-[#222]'>
                                {
                                    loading ?
                                        <div className='w-[20px] h-[20px]'>
                                            <Loader />
                                        </div>
                                        :
                                        <>
                                            Send  <FaLocationArrow />
                                        </>

                                }
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
                                className='cursor-pointer text-[#888] flex items-center gap-2'>
                                <FaPhoneAlt />  09625426771
                            </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className='font-semibold'>
                                Find us 
                            </div>
                            <div
                                className='cursor-pointer text-[#888] flex items-center gap-2'>
                                <IoLocationSharp />  Sauyo, Quezon City, Philippines
                            </div>
                        </div>
                        <div className='flex gap-4 mt-5 '>
                            <div 
                                   onClick={() => { window.open('https://www.facebook.com/marcuss09') }}
                            className='cursor-pointer'>
                                <FaFacebook />
                            </div>
                            <div
                            onClick={() => { window.open('https://github.com/marcusxro') }}
                             className='cursor-pointer'>
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
