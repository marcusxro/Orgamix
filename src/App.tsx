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
import { useEffect, useState } from 'react';
import useNotification from './comps/Notifs';
import { supabase } from './supabase/supabaseClient';
import IsLoggedIn from './comps/Utils/IsLoggedIn';
import CalendarPage from './pages/isLoggedIn/CalendarPage';
import Settings from './pages/isLoggedIn/Settings';
import SendDetails from './comps/System/NewUserModal/SendDetails';
import Tutorial from './comps/System/NewUserModal/Tutorial';
import CongratsModal from './comps/System/NewUserModal/CongratsModal';
import TabChangeTitle from './comps/MetaHeader/TabChangeTitle';
import About from './pages/Static/About';
import Contact from './pages/Static/Contact';
import NotFoundPage from './pages/Static/NotFoundPage';
import TestPage from './pages/TestPage';
import ArtificialIntelligence from './pages/isLoggedIn/ArtificialIntelligence';
import ViewAiChat from './pages/isLoggedIn/ViewAiChat';
import Pomodoro from './pages/isLoggedIn/Pomodoro';
import TimerModal from './comps/System/Timer/TimerModal';
import ResetPassword from './pages/AuthPages/Recover/ResetPassword';
import Pricing from './pages/Static/Pricing';
import Checkout from './pages/isLoggedIn/Checkout';
import Articles from './pages/Static/articles/Articles';
import ShowModalBan from './comps/Utils/ShowModalBan';
import Test from './pages/Static/Test';
import SuccessPayment from './pages/isLoggedIn/Callbacks/SuccessPayment';
import FailedPayment from './pages/isLoggedIn/Callbacks/FailedPayment';


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
  const { viewNotifs, setNotifData }: any = useStore();
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
      const subscription = supabase
        .channel('public:accounts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, (payload) => {
          handleRealtiveForAccounts(payload);
        })
        .subscribe();
      return () => {
        subscription.unsubscribe();
      };
    }

  }, [user, location.pathname, imageUrl]);




  const handleRealtiveForAccounts = (payload: any) => {
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
    setNotifications((prevNotifs) => {
      let updatedData = [...prevNotifs]; // Start with current notifications
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
      return updatedData; // Return the updated notification list to setNotifications
    });
  };


  async function getNotifs() {
    try {
      const { data, error } = await supabase
        .from('notification')
        .select('*')
        .eq('uid', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data); // Set initial notifications
        setNotifData(data)
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
        .eq('userid', user?.id);
      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setFetchedData(data);
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
        .list(`images/${user?.id}`, { limit: 1, search: 'profile_picture.jpg' });

      if (listError || !files || files.length === 0) {
        console.log('Profile picture not found.');
        setImageUrl({ publicUrl: null });
      } else {
        // Get the public URL if the profile picture exists
        const { data: publicData, error: urlError }: any = supabase
          .storage
          .from('profile')
          .getPublicUrl(`images/${user?.id}/profile_picture.jpg`);

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

      {
        location.pathname.includes('/user') && location.pathname !== '/user/pomodoro' &&
        <TimerModal />
      }
      {
        location.pathname.includes('/user') &&
        <ShowModalBan />
      }

      <Routes>
        {/* static pages */}
        <Route path='/' element={<Homepage />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='*' element={<NotFoundPage />} />
        <Route path='/test' element={<TestPage />} />
        <Route path='/pricing' element={<Pricing />} />

        {/* auth pages */}
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/recover' element={<ForgotPassword />} />
        <Route path='/reset-password/:uuid' element={<ResetPassword />} />




        <Route path='/articles' element={user && <Articles />} />

        <Route path='/test-payment' element={<Test />} />





        {/* system pages */}
        <Route path='/user/dashboard' element={user && <System />} />
        <Route path='/user/tasks' element={user && <Tasks />} />
        <Route path='/user/notes' element={user && <Notes />} />
        <Route path='/user/notes/:id/:time' element={user && <VisitNote />} />
        <Route path='/user/goals' element={user && <Goals />} />
        <Route path='/user/goals/templates' element={user && <GoalTemplates />} />
        <Route path='/user/goals/templates/:id/:time' element={<ViewGoal />} />
        <Route path='/user/projects' element={user && <Projects />} />
        <Route path='/user/projects/view/:id/:time' element={user && <Samp />} />
        <Route path='/user/calendar' element={user && <CalendarPage />} />
        <Route path='/user/ask-orgamix' element={<ArtificialIntelligence />} />
        <Route path='/user/ask-orgamix/:time' element={user && <ViewAiChat />} />
        <Route path='/user/pomodoro' element={user && <Pomodoro />} />
        <Route path='/user/settings' element={user && <Settings />} />
        {/* checkout */}
        <Route path='/user/checkout/:type' element={user && <Checkout />} />



        {/* payment callback urls */}
        <Route path='/user/success-payment' element={<SuccessPayment />} />
        <Route path='/user/failed-payment' element={<FailedPayment />} />




      </Routes>
      {
        location.pathname.includes('/user') &&
        <TabChangeTitle />
      }
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
