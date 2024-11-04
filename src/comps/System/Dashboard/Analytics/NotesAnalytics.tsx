import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';
import { motion } from 'framer-motion';
import AnalyticsLoader from './Loader/AnalyticsLoader';
import NoData from './Loader/NoData';

interface FetchedDataType {
    id: number;
    title: string;
    notes: string;
    category: string;
    userid: string;
    createdat: string;
}

interface CategoryData {
    category: string;
    count: number;
}

const NotesAnalytics: React.FC = () => {
    const [user] = IsLoggedIn();
    const [fetchedData, setFetchedData] = useState<FetchedDataType[] | null>(null);
    const [categorizedData, setCategorizedData] = useState<CategoryData[]>([]);

    useEffect(() => {
        if (user) {
            getNotes();
        }
    }, [user]);

    async function getNotes() {
        try {
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .eq('userid', user?.uid);

            if (error) {
                console.error(error);
            } else {
                setFetchedData(data);
                categorizeNotes(data); // Call the categorize function after fetching notes
            }
        } catch (err) {
            console.log(err);
        }
    }
    function categorizeNotes(notes: FetchedDataType[]) {
        const categoryMap: { [key: string]: { category: string; count: number; titles: string[] } } = {};

        notes.forEach(note => {
            const { category, title } = note;
            // Use "No Category" if the category is empty or undefined
            const categoryKey = category || "No Category";

            if (categoryMap[categoryKey]) {
                categoryMap[categoryKey].count += 1;
                categoryMap[categoryKey].titles.push(title); // Add title to the existing category
            } else {
                categoryMap[categoryKey] = {
                    category: categoryKey,
                    count: 1,
                    titles: [title], // Initialize titles array
                };
            }
        });

        setCategorizedData(Object.values(categoryMap)); // Convert the map to an array
    }


    return (

        <>
            {
                fetchedData !== null && fetchedData.length === 0 && (
                    <NoData propsText='No notes found' />
                )

            }
            {
                fetchedData === null && (
                   <AnalyticsLoader />
                )
            }
            {
                categorizedData.length > 0 && (
                    <ResponsiveContainer width="100%" height='100%'>
                        <BarChart data={categorizedData}>
                            <Bar dataKey="count"
                                fill="#222"
                                stroke="#535353"
                                strokeWidth={1}
                                radius={[5, 5, 0, 0]}
                                isAnimationActive={true}

                            />
                            <Tooltip
                                content={({ payload }) => {
                                    if (payload && payload.length) {
                                        const { category, count, titles } = payload[0].payload;
                                        return (
                                            <div
                                                style={{ backgroundColor: '#222', zIndex: '10000', position: 'relative', padding: '10px', borderRadius: '5px', border: '2px solid #535353' }}>
                                                <strong>{category}</strong><br />
                                                Count: {count}<br />
                                                Titles:
                                                <div className='flex flex-wrap gap-2 mt-2'>
                                                    {titles.join(', ')} {/* Display the titles here */}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )
            }
        </>

    );
};

export default NotesAnalytics;
