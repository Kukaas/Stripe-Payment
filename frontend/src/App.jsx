
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import './App.css'
import Subscription from './pages/payment/Subscription'
import Success from './pages/payment/Success'
import Cancel from './pages/payment/Cancel'
import Welcome from './pages/public/Welcome'

function App() {

  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/payment" element={<Subscription />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
   </BrowserRouter>
  )
}

export default App
