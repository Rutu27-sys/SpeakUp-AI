import React from 'react'
import './Auth.css'

const SignUp = () => {
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

         <button className='AuthBack'>Back</button>
         <div className="YellowAuthText">YOUR FIRST SMALL STEP</div>
         <div className="BlackAuthText">Let’s find your voice.</div>
         <div className="GreyAuthText">Create an account, then take a short assessment to get your personalized learning plan.</div>
         <button className='GoogleAuth'>Continue with Google</button>
         <div className="LineBreak">or with email</div>

        <form>

            <div>
                <label htmlFor="username">Your Name :</label>
                <input type="text" id="username" className='InputBox' name="username"></input>
            </div>

            <div>
                <label htmlFor="email">Email :</label>
                <input type="email" id="email" className='InputBox' name="email"></input>
            </div>

            <div>
                <label htmlFor="password">Password :</label>
                <input  id="password" name="password" className='InputBox' minLength={6}></input>
                <button type="button" >Show password
                </button>
            </div>
        
        </form>

        <button className="CreateAcc">Create account & find my level</button>
        <div className="GreyAuthText" id='AlreadyAcc'>Already have an account?  Log in</div>
      </div>
    </div>
  )
}

export default SignUp
