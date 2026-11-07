import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import FirstPage from './components/FirstPage.jsx'
import SignUp from './components/SignUp.jsx'

function App() {

  return (
    <div className="MainPage">
      <Navbar />
      <FirstPage />
      <SignUp />
    </div>
  )
}

export default App
