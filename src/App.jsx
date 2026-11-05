import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import FirstPage from './components/FirstPage.jsx'
import SecondPage from './components/SecondPage.jsx'

function App() {

  return (
    <div className="MainPage">
      <Navbar />
      <FirstPage />
      <SecondPage />
    </div>
  )
}

export default App
