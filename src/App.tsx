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

function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}

function Main() {
  const location = useLocation();
  const { viewNotifs }: any = useStore();
  
  console.log(location.pathname);

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
      </Routes>

      {/* Render Notification outside of Routes */}
      {viewNotifs && location.pathname.includes('/user') && <Notification />}
    </div>
  );
}

export default App;
