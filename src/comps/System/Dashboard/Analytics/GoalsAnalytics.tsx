import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../Utils/supabase/supabaseClient';
import IsLoggedIn from '../../../Utils/IsLoggedIn';
import AnalyticsLoader from './Loader/AnalyticsLoader';
import NoData from './Loader/NoData';

interface subtaskType {
    is_done: boolean;
    startedAt: string;
    subGoal: string;
}

interface habitsType {
    repeat: string;
    habit: string;
}

interface dataType {
    userid: string;
    id: number;
    title: string;
    category: string;
    is_done: boolean;
    created_at: number;
    description: string;
    sub_tasks: subtaskType[];
    habit: habitsType[];
    deadline: string;
}

const GoalsAnalytics: React.FC = () => {
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [user]:any = IsLoggedIn();

    useEffect(() => {
        if (user) {
            fetchGoalsByID();
        }
    }, [user]);


    async function fetchGoalsByID() {
        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('userid', user?.id);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                // Initialize categorized data structure
                const categorizedGoals: { [key: string]: { count: number; titles: string[] } } = {
                    'In Progress': { count: 0, titles: [] },
                    'Completed': { count: 0, titles: [] },
                    'Failed': { count: 0, titles: [] },
                };

                const now = new Date();

                data.forEach(goal => {
                    const deadline = new Date(goal.deadline);
                    // Categorize based on is_done and deadline
                    if (goal.is_done) {
                        categorizedGoals['Completed'].count += 1;
                        categorizedGoals['Completed'].titles.push(goal.title);
                    } else if (deadline > now) {
                        categorizedGoals['In Progress'].count += 1;
                        categorizedGoals['In Progress'].titles.push(goal.title);
                    } else {
                        categorizedGoals['Failed'].count += 1;
                        categorizedGoals['Failed'].titles.push(goal.title);
                    }
                });

                // Convert categorized goals to array format for BarChart
                const categorizedData: any = Object.keys(categorizedGoals).map(status => ({
                    category: status,
                    count: categorizedGoals[status].count,
                    titles: categorizedGoals[status].titles,
                }));

                if (data.length === 0) {
                    return setFetchedData([]);
                }
                setFetchedData(categorizedData);
            }
        } catch (err) {
            console.error('An error occurred:', err);
        }
    }


    return (
        <>
            {
                fetchedData === null && (
               <AnalyticsLoader />
                )
            }

            {
                fetchedData && fetchedData.length > 0 && (
                    <ResponsiveContainer width="100%" height='100%'>
                        <BarChart data={fetchedData || []}>
                            <Bar
                                dataKey="count"
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
                                                className='z-[2000000000000000] relative'
                                                style={{
                                                    backgroundColor: '#222',
                                                    zIndex: '10000',
                                                    position: 'relative',
                                                    padding: '10px',
                                                    borderRadius: '10px',
                                                    border: '2px solid #535353'
                                                }}
                                            >
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


            {
                fetchedData !== null && fetchedData.length === 0 && (

                 <NoData propsText='No goals found' />
                )
            }
        </>
    );
};

export default GoalsAnalytics;
