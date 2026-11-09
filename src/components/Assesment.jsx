import React from 'react'
import './Assesment.css'
const Assesment = () => {
  return (
    <div className='AssementPage' id='AssesmentPage'>

      <div className="AssesmentNav">
        <div className="AssesmentLogo">SpeakUp AI</div>
        <div className="AssesmentSmallText">STARTING POINT · ABOUT 3 MINUTES</div>
        <button className='SaveAndExit'>Save & exit</button>
      </div>

      <div className="TopProgressBar">
        <div className="StepIndicator"> 1. Introduce yourself</div>
        <div className="StepIndicator"> 2. Ask for directions</div>
        <div className="StepIndicator"> 3. Ask for support</div>
      </div>
      <div className="AssesmentText">
      <div className="AssesmentBlueText">LET’S FIND YOUR STARTING POINT</div>
      <div className="AssesmentBlackText" id='AssementHeadText'>First, just be yourself.</div>
      <div className="AssesmentGreyText">Three short responses. No pass or fail. This helps Toki build a plan around your voice.</div>
      </div>
<div className="AssesmentPageGrid">
<div className="AssesmentLeftPanel">
      <div className="AssesmentTokiCard">
        <div className="AssesmentBlueText">QUESTION 1 OF 3 · EVERYDAY INTRODUCTIONS</div>
        <div className="AssesmentTokiImg"></div>
        <div className="AssesmentBlackText">“Hi! Tell me a little about yourself and something you enjoy doing.”</div>
        <div className="AssementGreytext">Imagine we’ve just met at a class. A few sentences are plenty.</div>
      </div>

      <div className="ListeningCard">
        <div className="Microphone">Microphone connected · Not recording</div>
        <div className="VoiceWave"></div>
        <button className='StartRecording'>Start Recording</button>
        <button className='StopRecording'>Stop recording</button>
        <div className="AssesmentGreyText">Recording starts only when you press the microphone. Review or re-record your answer before continuing.</div>
      </div>
</div>

<div className="AssesmentRightPanel">

      <div className="AssesmentNote">
        <div className="AssesmentBlueText">A NOTE FROM TOKI</div>
        <div className="AssesmentBlackText">Not a test. A hello.</div>
        <div className="AssesmentGreyText">Pause if you need to. Use your own words. There isn’t a “right” personality or accent here.</div>
        <div className="AssesmentBlackText">What we’ll notice</div>
        <div className="AssesmentGreyText">1. Clarity: how easily your ideas come through. <br></br>
                                           2. Response speed: how long it takes to begin speaking.
        </div>

        <div className="Yellowcard">
            <div className="AssesmentBlueText">YOUR MIC, YOUR CONTROL</div>
            <div className="AssesmentGreyText">Ready → Start recording Recording → Stop & review Review → Re-record or continue<br></br>
            Can’t hear yourself? Check your browser microphone permission or change your input in audio settings.</div>
        </div>

        <button className='NextQuestion'>Next question →</button>
      </div>
</div>
</div>
    </div>
  )
}

export default Assesment
