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
import Settings from './pages/isLoggedIn/Settings';
import SendDetails from './comps/System/NewUserModal/SendDetails';
import Tutorial from './comps/System/NewUserModal/Tutorial';
import CongratsModal from './comps/System/NewUserModal/CongratsModal';


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
interface AccType {
  userid: string;
  username: string;
  password: string;
  email: string;
  id: number;
  fullname: string;
  is_done: boolean;
  has_pfp: boolean
}

interface pubsType {
  publicUrl: string | null;
}

function Main() {
  const location = useLocation();
  const { viewNotifs }: any = useStore();
  const { notifyUser } = useNotification();
  const [_, setNotifications] = useState<dataType[]>([]);
  const [user]: any = IsLoggedIn()
  const [fetchedData, setFetchedData] = useState<AccType[] | null>(null);
  const [imageUrl, setImageUrl] = useState<pubsType | null>(null);

  useEffect(() => {
    getNotifs();
  }, [])
  useEffect(() => {
    if (user) {
      getNotifs();
      fetchImage()
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


  useEffect(() => {
    if (user && location.pathname.includes('/user')) {
      getAccounts()
      console.log(fetchedData)
      const subscription = supabase
        .channel('public:accounts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, (payload) => {
          console.log('Realtime event:', payload);
          handleRealtiveForAccounts(payload);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };

    }

  }, [user, location.pathname, imageUrl]);


  

  const handleRealtiveForAccounts = (payload: any) => {
    console.log('Received payload:', payload); // Check the payload structure

    switch (payload.eventType) {
      case 'INSERT':
        setFetchedData((prevData) =>
          prevData ? [...prevData, payload.new] : [payload.new]
        );
        break;
      case 'UPDATE':
        setFetchedData((prevData) =>
          prevData
            ? prevData.map((item) =>
              item.id === payload.new.id ? payload.new : item
            )
            : [payload.new]
        );
        break;
      case 'DELETE':
        console.log("DELETED")
        setFetchedData((prevData) =>
          prevData ? prevData.filter((item) => item.id !== payload.old.id) : null
        );
        break;
      default:
        break;
    }
  }




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
          fetchImage()
          handleClick(payload?.new?.content, payload?.new?.linkofpage)
          break;
        case 'UPDATE':
          fetchImage()
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


  async function getAccounts() {
      try {
      const { data, error } = await supabase.from('accounts')
        .select('*')
        .eq('userid', user?.uid);
      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setFetchedData(data);
        console.log(data)

        if (data.length === 0) {
          console.log("----------NO DATA----------")
        }
      }
    } catch (err) {
      console.log(err);
    
    }
  }

  const fetchImage = async () => {
    if (!user) return;
    try {
      // Check if the profile picture exists in the specified folder
      const { data: files, error: listError } = await supabase
        .storage
        .from('profile')
        .list(`images/${user?.uid}`, { limit: 1, search: 'profile_picture.jpg' });

      if (listError || !files || files.length === 0) {
        console.log('Profile picture not found.');
        setImageUrl({ publicUrl: null });
      } else {
        // Get the public URL if the profile picture exists
        const { data: publicData, error: urlError }: any = supabase
          .storage
          .from('profile')
          .getPublicUrl(`images/${user?.uid}/profile_picture.jpg`);

        if (urlError) {
          console.error('Error getting public URL:', urlError.message);
          setImageUrl({ publicUrl: null });
        } else {
          setImageUrl({ publicUrl: `${publicData.publicUrl}?t=${Date.now()}` });
        }
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };



  const { isProgress }: any = useStore()

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

        <Route path='/user/settings' element={<Settings />} />


        <Route path='/test' element={<TestUpload />} />

      </Routes>

      {
        location.pathname.includes('/user') && fetchedData && imageUrl && user &&
        ((fetchedData?.length === 0 && user && fetchedData && fetchedData[0]?.has_pfp != true && fetchedData[0]?.is_done === false) || !(fetchedData && fetchedData[0]?.has_pfp)) && isProgress != "Completed" &&
        <SendDetails />

      }
      {
        location.pathname.includes('/user') && fetchedData &&
        (fetchedData[0]?.is_done === false && (fetchedData && fetchedData[0]?.has_pfp)) && isProgress === "tutorial" && fetchedData.length > 0 &&
        <Tutorial />

      }
      {
        location.pathname.includes('/user') && fetchedData &&
        (fetchedData[0]?.is_done === true && (fetchedData != null || imageUrl?.publicUrl != null) && isProgress === "Completed") &&
        <CongratsModal />
      }



      {/* Render Notification outside of Routes */}
      {viewNotifs && location.pathname.includes('/user') && <Notification />}
    </div>
  );
}

export default App;
