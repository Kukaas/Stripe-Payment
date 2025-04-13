
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import './App.css'
import Subscription from './pages/payment/Subscription'
import Success from './pages/payment/Success'
import Cancel from './pages/payment/Cancel'

import Welcome from './pages/public/Welcome'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import PrivateRoute from './components/PrivateRoute'
import PublicRoute from './components/PublicRoutes'


import Dashboard from './pages/private/Dashboard'
import Profile from './pages/private/Profile'
import VerifyEmail from './pages/auth/VerifyEmail'

function App() {

  return (
   <BrowserRouter>
      <Routes>

        
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Welcome />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>


        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/payment" element={<Subscription />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
   </BrowserRouter>
  )
}

export default App
