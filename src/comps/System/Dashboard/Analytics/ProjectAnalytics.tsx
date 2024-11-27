import React, { useEffect, useState } from 'react';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../../supabase/supabaseClient';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';
import AnalyticsLoader from './Loader/AnalyticsLoader';
import NoData from './Loader/NoData';

interface invitedEmails {
    username: string;
    email: string;
    uid: string;
}

interface updatedAt {
    date: string;
    username: string;
    email: string;
    uid: string;
    itemMoved: string;
}

interface tasksType {
    title: string;
    created_at: number;
    created_by: string;
    priority: string;
    type: string;
    start_work: string;
    deadline: string;
    assigned_to: string; //uid basis
}

interface boardsType {
    title: string;
    titleColor: string; //hex
    created_at: number;
    board_uid: string;
    created_by: string;
    tasks: tasksType[];
}

interface MessageType {
    userEmail: any;
    userid: any;
    id: number; //timestamp
    content: string;
}

interface dataType {
    description: string;
    id: number;
    created_at: number;
    name: string;
    created_by: string;
    deadline: number;
    is_shared: any;
    invited_emails: null | invitedEmails[];
    updated_at: null | updatedAt[];
    is_favorite: boolean;
    boards: boardsType[];
    chatArr: MessageType[];
}

const ProjectAnalytics: React.FC = () => {
    const [fetchedData, setFetchedData] = useState<dataType[] | null>(null);
    const [user]:any = IsLoggedIn();

    useEffect(() => {
        if (user) {
            getProjects();
        }
    }, [user]);

    async function getProjects() {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('created_by', user?.id);

            if (error) {
                console.error('Error fetching data:', error);
            } else {
                if (data) {
                    const filteredData = data.filter(itm => itm.created_by === user?.id);
                    setFetchedData(filteredData);
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    // Function to categorize projects
    const categorizeProjects: any = (projects: dataType[] | null) => {
        const categorizedData: {
            [key: string]: { count: number; titles: string[] }
        } = {
            'In Progress': { count: 0, titles: [] },
            'Failed': { count: 0, titles: [] },
            'Starred': { count: 0, titles: [] },
        };

        const now = Date.now();

        projects?.forEach((project: any) => {
            const isStarred = project.is_favorite;
            const isFailed = project.deadline < now;

            if (isFailed) {
                categorizedData['Failed'].count += 1;
                categorizedData['Failed'].titles.push(project.name);
            } else {
                categorizedData['In Progress'].count += 1;
                categorizedData['In Progress'].titles.push(project.name);
            }

            if (isStarred) {
                categorizedData['Starred'].count += 1;
                categorizedData['Starred'].titles.push(project.name);
            }
        });

        return Object.keys(categorizedData).map(status => ({
            category: status,
            count: categorizedData[status].count,
            titles: categorizedData[status].titles,
        }));
    };

    const categorizedData = fetchedData ? categorizeProjects(fetchedData) : [];

    return (
        <>
            {
                fetchedData === null && (
                    <AnalyticsLoader />
                )
            }
            {
                fetchedData !== null && fetchedData.length === 0 && (   
                    <NoData propsText='No projects found' />
                )
            }
            {
                fetchedData != null && fetchedData.length > 0 && (

                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categorizedData}>
                            <Bar
                                dataKey="count"
                                fill="#222"
                                stroke="#535353"
                                strokeWidth={1}
                                radius={[5, 5, 0, 0]}
                                isAnimationActive={false}
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
                                                    border: '2px solid #535353',
                                                }}
                                            >
                                                <strong>{category}</strong><br />
                                                Count: {count}<br />
                                                Titles:
                                                <div className='flex flex-wrap gap-2 mt-2'>
                                                    {titles.join(', ')}
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

export default ProjectAnalytics;
