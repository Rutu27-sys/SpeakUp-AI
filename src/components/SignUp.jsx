import React, { useState } from 'react';
import './Auth.css'

const SignUp = ({onBack, onSignupSuccess}) => {

  const [formData, setFormData] = useState({
    username: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Account created successfully, ${data.username}! Please log in.`);
        onSignupSuccess(); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <div className='SignUpAuth'>

      <div className="LeftPanel">
        <div className="Logo">SpeakUp AI</div>
        <div className="FirstHead">YOUR VOICE DESERVES A LITTLE SPACE</div>
        <div className="SecondHead">Start small.<br></br>Speak a little bigger.</div>
        <div className="ThirdHead">A safe place to practice the conversations that matter, with Toki by your side.</div>
        <div className="TokiAuthCard">
            <div className="TokiAuthImg"></div>
            <div className="YellowAuthText">“You don’t have to know what to say yet. We’ll figure it out together.”</div>
        </div>
        <div className="LastHead">Practice at your pace. Your voice, your journey.</div>
      </div>

      <div className="RightPanel">

         <button className='AuthBack' type='button' onClick={onBack}>Back</button>
         <div className="YellowAuthText">YOUR FIRST SMALL STEP</div>
         <div className="BlackAuthText">Let’s find your voice.</div>
         <div className="GreyAuthText" style={{ textAlign: 'left' }}>Create an account, then take a short assessment to get your personalized learning plan.</div>
         <button className='GoogleAuth'>Continue with Google</button>
         <div className="LineBreak">or with email</div>

        <form onSubmit={handleSubmit}>

            <div className='InputContainer'>
                <label htmlFor="username">Your Name :</label>
                <input type="text" id="username" className='InputBox' name="username" value={formData.username} onChange={handleChange} required></input>
            </div>

            <div className='InputContainer'>
                <label htmlFor="email">Email :</label>
                <input type="email" id="email" className='InputBox' name="email" value={formData.email} onChange={handleChange} required></input>
            </div>

            <div className='InputContainer'>
                <label htmlFor="password">Password :</label>
                <input  type={showPassword ? 'text' : 'password'} id="password" name="password" className='InputBox' minLength={6} value={formData.password} onChange={handleChange} required></input>
                <button type="button" onClick={() => setShowPassword((prev) => !prev)}
                className="ShowPasswordBtn">{showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
           
           <button type="submit" className="CreateAcc" >Create account & find my level</button>

        </form>

        
        <a className="GreyAuthText" id='AlreadyAcc' href="#login">Already have an account?  Log in</a>
      </div>
    </div>
  )
}

export default SignUp
