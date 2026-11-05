import React from 'react'
import './FirstPage.css'
import './SecondPage.css'

const FirstPage = () => {
  return (
    <div className="FirstPage">

    <div className="MainDiv">
         <div id="head1"> A little practice. A louder you.</div>
         <div id="head2">Find your words. <br></br>Find your voice.</div>
         <div id="head3">Big interview. Tricky conversation. Everyday hello. Build the confidence to speak up—with an AI companion whos always in your corner..</div>

         <button id="head4">Find My Starting Level </button>
         <button id="head5">See How It Works </button>
         <div id="head6">✓ 3-minute first assessment   ✓ No perfect words needed</div>
    </div>

    <div className="SecondDiv">
        <div id="head7"> Ready when you are. Let’s try together.</div>
        <div className="head8">
          <div id="head8"> YOUR FIRST SMALL STEP.</div>
          <div id="head9">“Tell me a little about yourself.”</div>
          <div id="head10">A safe space to try. And try again.</div>
        </div>
    </div>

    <div className='SecondPage'>
      <div className="Headings">
        <div>Practice out loud</div>
        <div>Real-life role simulations</div>
        <div>Feedback you can use</div>
        <div>Progress at your pace</div>
      </div>
    </div>

    <div className="ThirdDiv">
        <div id="Sec1"> REAL LIFE, WITH A REHEARSAL BUTTON.</div>
        
    </div>

    </div>
  )
}

export default FirstPage
