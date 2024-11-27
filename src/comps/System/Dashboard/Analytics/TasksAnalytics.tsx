import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';
import AnalyticsLoader from './Loader/AnalyticsLoader';
import NoData from './Loader/NoData';

interface TaskDataType {
    title: string;
    deadline: string;
    description: string;
    id: number;
    isdone: boolean;
    priority: string;
    userid: string;
    repeat: string;
    createdAt: string;
    link: string[];
    category: string;
}

interface CategoryData {
    category: string;
    count: number;
    titles: string[]; // Array to store titles of tasks in this category
}

const TasksAnalytics: React.FC = () => {
    const [user]:any = IsLoggedIn();
    const [taskData, setTasksData] = useState<TaskDataType[] | null>(null);
    const [categorizedData, setCategorizedData] = useState<CategoryData[]>([]);

    useEffect(() => {
        getUserTask();
        console.log(user)
    }, [user]);

    useEffect(() => {
        if (taskData) {
            categorizeTasks(taskData);
        }
    }, [taskData]);

    async function getUserTask() {
        try {
            if (!user) {
                console.error('User is not defined or uid is missing');
                return;
            }

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('userid', user?.id)

            if (data) {
                setTasksData(data);
            } else {
                console.log("Error:", error);
            }
        } catch (err) {
            console.error("Error fetching tasks:", err);
        }
    }
    function categorizeTasks(tasks: TaskDataType[]) {
        const categoryMap: { [key: string]: CategoryData } = {};

        tasks.forEach(task => {
            const { category, title } = task;
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
                taskData && taskData.length === 0 &&
                <NoData propsText='No tasks found' />
            }
            {
                taskData === null && (

                    <AnalyticsLoader />
                )


            }

            {categorizedData.length > 0 &&
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categorizedData}>
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
                                            style={{ backgroundColor: '#222', zIndex: '10000', position: 'relative', padding: '10px', borderRadius: '10px', border: '2px solid #535353' }}>
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
            }
        </>
    );
};

export default TasksAnalytics;
