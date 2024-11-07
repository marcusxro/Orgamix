import React, { useState, useEffect } from 'react';
import IsLoggedIn from '../../../../firebase/IsLoggedIn';
import { supabase } from '../../../../supabase/supabaseClient';
import moment from 'moment';
import { BarChart, Bar, Tooltip, XAxis, ResponsiveContainer } from 'recharts';

const WeeklyActivity: React.FC = () => {
  const [user] = IsLoggedIn();
  const [isLoaded, setIsLoaded] = useState(false);
  interface WeeklyData {
    day: string;
    percentage: number;
    titles: string[];
  }
  
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);

  useEffect(() => {
    if (user) fetchAllData();
  }, [user]);

  async function fetchAllData() {
    const tasks = await fetchUserTasks();
    const goals = await fetchUserGoals();
    const projects = await fetchUserProjects();
    const notes: any = await fetchUserNotes();

    if (tasks && goals && projects) {
      setIsLoaded(true);
      processWeeklyData([...tasks, ...goals, ...projects, ...notes]);
    }
  }




  function processWeeklyData(data: any) {
    // Set the start and end of the current week
    const startOfCurrentWeek = moment().startOf('isoWeek'); // Current Monday
    const endOfCurrentWeek = moment().endOf('isoWeek'); // Current Sunday
  
    const weeklyCounts: any = {
      Mon: { count: 0, titles: [] },
      Tue: { count: 0, titles: [] },
      Wed: { count: 0, titles: [] },
      Thu: { count: 0, titles: [] },
      Fri: { count: 0, titles: [] },
      Sat: { count: 0, titles: [] },
      Sun: { count: 0, titles: [] },
    };
  
    data.forEach((item: any) => {
      const createdAt = item.created_at ? moment(parseInt(item.created_at)) :
        item.createdAt ? moment(parseInt(item.createdAt)) :
          item.createdat ? moment(parseInt(item.createdat)) : null;
  
      if (createdAt && createdAt.isBetween(startOfCurrentWeek, endOfCurrentWeek, 'day', '[]')) {
        const dayName = createdAt.format('ddd'); // Get the short name for the day
        if (weeklyCounts[dayName] !== undefined) {
          weeklyCounts[dayName].count += 1;
          if (item.title || item.name) {
            weeklyCounts[dayName].titles.push(item.title || item.name);
          }
        }
      }
    });
  
    const maxCount = Math.max(...Object.values(weeklyCounts).map((day: any) => day.count));
    const weeklyDataFormatted: any = Object.keys(weeklyCounts).map((day) => ({
      day: day, // Day name as the key (already in 3-letter format)
      percentage: maxCount ? (weeklyCounts[day].count / maxCount) * 100 : 0,
      titles: weeklyCounts[day].titles
    }));
  
    setWeeklyData(weeklyDataFormatted);
  }
  


  async function fetchUserTasks() {
    if (!user) return null;
    const { data, error } = await supabase.from('tasks').select('*').eq('userid', user.uid);
    if (error) console.error('Error fetching tasks:', error);
    return data;
  }


  async function fetchUserNotes() {
    if (!user) return null;
    const { data, error } = await supabase.from('notes').select('*').eq('userid', user.uid);
    if (error) console.error('Error fetching tasks:', error);
    return data;
  }

  async function fetchUserGoals() {
    if (!user) return null;
    const { data, error } = await supabase.from('goals').select('*').eq('userid', user.uid);
    if (error) console.error('Error fetching goals:', error);
    return data;
  }

  async function fetchUserProjects() {
    if (!user) return null;
    const { data, error } = await supabase.from('projects').select('*').eq('created_by', user.uid);
    if (error) console.error('Error fetching projects:', error);
    return data;
  }

  const CustomBarLabel = ({ x, y, value, height }: any) => {
    const centerY = y + height; // Position the labels at the bottom of the bar
  
    // Check if the value is greater than 0 to display the label
    if (value <= 0) return null; // Hide label if value is 0
  
    return (
      <g>
        <text
          x={x + 5} 
          y={centerY - 8} // Adjust y position for percentage label
          fill="green"
          fontSize={10}
        >
          {`${value.toFixed(2)}%`}
        </text>
      </g>
    );
  };
  
  
  return (
    <>
      {isLoaded ? (
        <ResponsiveContainer width="100%" height='100%'>
          <BarChart data={weeklyData}>

            <XAxis
              className='text-sm mr-9'
              dataKey="day"
            />


            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const { percentage, titles } = payload[0].payload;
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
                      <div className='text-green-500 mb-3'>
                        {percentage.toFixed(2)}%
                      </div>


                      <div>
                        {titles.map((title: string, index: number) => (
                          <div key={index}>{title}</div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Bar
              dataKey="percentage"
              fill="#222"
              stroke="#535353"
              strokeWidth={1}
              radius={[5, 5, 0, 0]}
              isAnimationActive={true}
              label={(props: any) => <CustomBarLabel {...props} day={weeklyData[props.index].day} />}
            />

          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export default WeeklyActivity;
