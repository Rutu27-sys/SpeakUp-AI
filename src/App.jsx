import { useState } from 'react'
import './App.css';
import Navbar from './components/Navbar.jsx';
import FirstPage from './components/FirstPage.jsx';
import SignUp from './components/SignUp.jsx';
import Login from './components/Login.jsx';
import Assesment from './components/Assesment.jsx';
import Dashboard from './components/Dashboard.jsx';

function App() {

  const [currentView,setCurrentView] = useState('landing') ;
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData); 
  };

  if (user) {
    if (!user.hasCompletedAssessment) {
      return (
        <Assesment user={user} onAssessmentComplete={() => {
            setUser(prev => ({ ...prev, hasCompletedAssessment: true }));
          }} 
        />
      );
    }
    return <Dashboard user={user} />;
  }
  if (currentView === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} onBack={() => setCurrentView('landing')} />;
  }
  if (currentView === 'signup') {
    return <SignUp onSignupSuccess={() => setCurrentView('login')} onBack={() => setCurrentView('landing')} />;
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
