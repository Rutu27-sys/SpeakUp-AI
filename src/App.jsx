import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import FirstPage from './components/FirstPage.jsx'
import SignUp from './components/SignUp.jsx'
import Login from './components/Login.jsx'

function App() {

  const [currentView,setCurrentView] = useState('landing') ;

  if(currentView === 'login'){
    return <Login onBack={() => setCurrentView('landing')} />;
  }
  if(currentView === 'signup'){
    return <SignUp onBack={()=> setCurrentView('landing')} />;
  }

  return (
    <div className="MainPage">
      <Navbar onLoginClick={()=> setCurrentView('login')}
              onSignUpClick={()=> setCurrentView('signup')} />
      <FirstPage />
    </div>
  )
}

export default App
