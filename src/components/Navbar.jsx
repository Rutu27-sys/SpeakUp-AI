import React from 'react'
import { Link } from 'react-scroll'
import './Navbar.css'

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">SpeakUp AI</div>

        <div className="navcenter">
          <Link to="HowItWorks" spy={true} smooth={true} duration={500} className="tag" activeClass="active">How It Works</Link>
          <Link to="PracticeScenarios" spy={true} smooth={true} duration={500} className="tag" activeClass="active">Practice Scenarios</Link>
          <Link to="MeetToki" spy={true} smooth={true} duration={500} className="tag" activeClass="active">Meet Toki</Link>
        </div>

        <div className="navright">
          <button className="Login"  >Login</button>
          <button className="SignUp"  >Sign Up</button>
        </div>
    </nav>
  )
}

export default Navbar
