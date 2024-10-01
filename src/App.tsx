import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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



function App() {
  return (
    <Router>
      <div className="App">
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

        </Routes>
      </div>
    </Router>
  )
}

export default App
