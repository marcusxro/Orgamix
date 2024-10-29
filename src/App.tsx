import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import ForgotPassword from './pages/AuthPages/ForgotPassword';
import System from './pages/isLoggedIn/System';
import Tasks from './pages/isLoggedIn/Tasks';
import Notes from './pages/isLoggedIn/Notes';
import VisitNote from './comps/System/VisitNote';
import Goals from './pages/isLoggedIn/Goals';
import GoalTemplates from './pages/isLoggedIn/GoalTemplates';
import ViewGoal from './pages/isLoggedIn/ViewGoal';
import ScrollToTop from './comps/ScrollToTop';
import Projects from './pages/isLoggedIn/Projects';
import Samp from './pages/isLoggedIn/Samp';
import useStore from './Zustand/UseStore';
import Notification from './comps/System/Notification';
import TestUpload from './pages/TestUpload';
import { useEffect, useState } from 'react';
import useNotification from './comps/Notifs';
import { supabase } from './supabase/supabaseClient';
import IsLoggedIn from './firebase/IsLoggedIn';
import CalendarPage from './pages/isLoggedIn/CalendarPage';


function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}

interface dataType {
  id: number;
  content: string;
  created_at: any; // Assuming this is a timestamp in milliseconds
  uid: string;
  linkofpage: string;
}

function Main() {
  const location = useLocation();
  const { viewNotifs }: any = useStore();
  const { notifyUser } = useNotification();
  const [_, setNotifications] = useState<dataType[]>([]);
  const [user] = IsLoggedIn()

  useEffect(() => {

    if(user){
      getNotifs();
      const subscription = supabase
        .channel('public:notification')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notification' }, (payload) => {
          console.log('Realtime event:', payload);
          handleRealtimeEvent(payload);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    
    }
  }, [user]);

  const handleClick = (tetx: string, link: string) => {
    notifyUser(tetx, link);
  };

  const handleRealtimeEvent = (payload: any) => {
    console.log('Received payload:', payload); // Check the payload structure

    setNotifications((prevNotifs) => {
      let updatedData = [...prevNotifs]; // Start with current notifications
      console.log(payload)
      switch (payload.eventType) {
        case 'INSERT':
          updatedData.push(payload.new); // Add new notification
          handleClick(payload?.new?.content, payload?.new?.linkofpage)
          break;
        case 'UPDATE':
          updatedData = updatedData.map((item) =>
            item.id === payload.new.id ? payload.new : item
          );
          break;
        case 'DELETE':
          updatedData = updatedData.filter((item) => item.id !== payload.old.id);
          break;
        default:
          console.warn('Unhandled event type:', payload.eventType);
          return prevNotifs;
      }

      console.log('Updated notifications:', updatedData); // Log updated notifications


      return updatedData; // Return the updated notification list to setNotifications
    });
  };
  async function getNotifs() {
    try {
      const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('uid', user?.uid)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data); // Set initial notifications
      }

      if (error) {
        console.log(error);
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/recover' element={<ForgotPassword />} />
        <Route path='/user/dashboard' element={<System />} />
        <Route path='/user/tasks' element={<Tasks />} />
        <Route path='/user/notes' element={<Notes />} />
        <Route path='/user/notes/:uid/:time' element={<VisitNote />} />
        <Route path='/user/goals' element={<Goals />} />
        <Route path='/user/goals/templates' element={<GoalTemplates />} />
        <Route path='/user/goals/templates/:uid/:time' element={<ViewGoal />} />
        <Route path='/user/projects' element={<Projects />} />
        <Route path='/user/projects/view/:uid/:time' element={<Samp />} />

        <Route path='/user/calendar' element={<CalendarPage />} />
        <Route path='/test' element={<TestUpload />} />

      </Routes>

      {/* Render Notification outside of Routes */}
      {viewNotifs && location.pathname.includes('/user') && <Notification />}
    </div>
  );
}

export default App;
