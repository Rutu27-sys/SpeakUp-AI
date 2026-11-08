import React, { useState } from 'react';
import './Auth.css'

const Login = () => {
   const [formData, setFormData] = useState({
      email: '',
      password: '',
    });
  
    const [showPassword, setShowPassword] = useState(false);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with Data:', formData);
    alert(`Welcome back, ${formData.email}! Logged in successfully.`);
  };

  return (
    <div className='LoginPage'>
      
      <div className="LeftPanel">
        <div className="Logo">SpeakUp AI</div>
        <div className="FirstHead">GOOD TO SEE YOU AGAIN</div>
        <div className="SecondHead">Welcome back.<br></br>Your next step is waiting.</div>
        <div className="ThirdHead">No catching up. No pressure. Pick up right where you left off—with your biggest little supporter.</div>
        <div className="TokiAuthCard">
            <div className="TokiAuthImg"></div>
            <div className="YellowAuthText">“You showed up for your voice today. That’s already a good start.”</div>
        </div>
        <div className="LastHead">Practice at your pace. Your voice, your journey.</div>
      </div>

      <div className="RightPanel">

         <button className='AuthBack'>Back</button>
         <div className="YellowAuthText">YOUR LEARNING STUDIO</div>
         <div className="BlackAuthText">Ready for another try?</div>
         <div className="GreyAuthText" style={{ textAlign: 'left' }}>Log in to continue your personalized learning path.</div>
         <button className='GoogleAuth'>Continue with Google</button>
         <div className="LineBreak">or with email</div>

        <form onSubmit={handleSubmit}>

            <div className='InputContainer'>
                <label htmlFor="email">Email address :</label>
                <input type="email" id="email" className='InputBox' name="email" value={formData.email} onChange={handleChange} required></input>
            </div>

            <div className='InputContainer'>
                <label htmlFor="password">Password :</label>
                <input  type={showPassword ? 'text' : 'password'} id="password" name="password" className='InputBox' minLength={6} value={formData.password} onChange={handleChange} required></input>
                <button type="button" onClick={() => setShowPassword((prev) => !prev)}
                className="ShowPasswordBtn">{showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
           
           <button type="submit" className="CreateAcc" >Log in to my studio</button>
           
        </form>

        
        <a className="GreyAuthText" id='AlreadyAcc' href="#login">New to SpeakUp AI?  Create an account</a>
      </div>

    </div>
  )
}

export default Login
