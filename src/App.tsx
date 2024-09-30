import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import ForgotPassword from './pages/AuthPages/ForgotPassword';
import System from './pages/isLoggedIn/System';
import Tasks from './pages/isLoggedIn/Tasks';



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
        </Routes>
      </div>
      </Router>
  )
}

export default App
