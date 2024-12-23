import React, { useEffect, useState } from 'react'
import Menu from '../../../comps/Menu'
import Header from '../../../comps/Header'
import useStore from '../../../Zustand/UseStore'
import MetaEditor from '../../../comps/MetaHeader/MetaEditor'
import ArticleArr from './ArticleJSON'
import Footer from '../../../comps/Footer'

interface Article {
    id: number,
    title: string,
    description: string,
    content: string,
    type: string,
    Date: string,
    Image: string,
    Author: string
}

const Articles: React.FC = () => {
    const { showMenu }: any = useStore()


    const [yearValue, setYearValue] = useState('All')
    const [typeValue, setTypeValue] = useState('All')


    const [filteredArticles, setFilteredArticles] = useState<Article[]>([])

    const [searchValue, setSearchValue] = useState('')


    useEffect(() => {
        setFilteredArticles(ArticleArr)
    }, [])

    useEffect(() => {
        filterArticles()
    }, [yearValue, typeValue, searchValue])

    function filterArticles() {
        let tempArr: Article[] = ArticleArr;

        if (yearValue !== 'All') {
            tempArr = tempArr.filter((article: Article) => {
                return article.Date.includes(yearValue);
            });
        }

        if (typeValue !== 'All') {
            tempArr = tempArr.filter((article: Article) => {
                return article.type === typeValue;
            });
        }

        if (searchValue) {
            tempArr = tempArr.filter((article: Article) => {
                return article.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                       article.description.toLowerCase().includes(searchValue.toLowerCase()) ||
                       article.content.toLowerCase().includes(searchValue.toLowerCase()) ||
                       article.Author.toLowerCase().includes(searchValue.toLowerCase());
            });
        }

        setFilteredArticles(tempArr);
    }

    return (
        <div className='relative'>
            {
                showMenu &&
                <Menu />
            }
       <Header />

            <MetaEditor
                title='Orgamix | Articles'
                description='Read articles about Orgamix'
            />

            <div className='px-4'>
                <div className='h-screen  mx-auto w-full max-w-[1200px] pt-5  mt-[1rem] '>
                    <div className='text-3xl font-bold'>
                        Explore Articles
                    </div>

                    <div className='p-3 bg-[#191919] gap-5 border-[1px] border-[#535353] mt-9 rounded-md flex items-start justify-start'>
                        <div className='flex gap-3 flex-col items-start justify-start w-full max-w-[300px] '>
                            <div>
                                Article type
                            </div>
                            <select
                                onChange={(e) => { setTypeValue(e.target.value) }}
                             className='bg-[#313131] p-2 rounded-md border-[1px] border-[#535353] w-full'>
                                <option value="All">All</option>
                                <option value="Troubleshooting">Troubleshooting</option>
                                <option value="Management">Management</option>
                            </select>
                        </div>

                        <div className='flex gap-3 flex-col items-start justify-start w-full max-w-[300px] '>
                            <div>
                                Year
                            </div>
                            <select
                                onChange={(e) => { setYearValue(e.target.value) }}

                             className='bg-[#313131] p-2 rounded-md border-[1px] border-[#535353] w-full'>
                                <option value="All">All</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                    </div>
                    <div className='mt-[1rem]  w-full flex flex-col gap-8 items-end '>
                        <input
                            onChange={(e) => { setSearchValue(e.target.value) }}
                            value={searchValue}
                        className='p-3 max-w-[600px] w-full rounded-md bg-[#191919] outline-none border-[1px] border-[#535353]'
                        type="text" placeholder='Search Articles' />
                    </div>
                    <div className='mt-[4rem]  w-full flex flex-col gap-8'>
                        {
                            filteredArticles.length === 0 &&
                            <div className='text-[#888]'>
                                No articles found
                            </div>
                        }
                        {
                            filteredArticles.map((article: Article) => {
                                return (
                                    <div className='w-full cursor-pointer flex-col-reverse md:flex-row border-b-[1px] border-b-[#535353] h-auto md:h-[220px] flex justify-between gap-3 pb-[2rem]'>

                                        <div className='w-full md:w-[200px] flex flex-row gap-2 md:flex-col'>
                                            <div className='font-semibold'>
                                                {article.type}
                                            </div>
                                            <div className='md:hidden block'>
                                                |
                                            </div>
                                            <div className='text-[#888]'>
                                                {article.Date}
                                            </div>
                                        </div>

                                        <div className='flex gap-3'>
                                            <div className='w-full flex flex-col gap-3 justify-between'>
                                                <div>
                                                    <div className='text-xl font-bold'>
                                                        {article.title}
                                                    </div>
                                                    <div className='text-[#888] text-sm'>
                                                        {article.description}
                                                    </div>
                                                </div>

                                                <div>
                                                    {article.Author}
                                                </div>
                                            </div>

                                            <div className='w-[350px] h-[150px] rounded-md overflow-hidden'>
                                                <img
                                                    className='w-full h-full object-cover rounded-md'
                                                    src={article.Image} alt="" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </div>
                </div>
            </div>

            <div>
                <Footer />
            </div>
        </div>
    )
}

export default Articles
