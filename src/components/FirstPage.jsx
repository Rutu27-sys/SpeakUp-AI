import React from 'react'
import './FirstPage.css'
import './SectionPage.css'

const FirstPage = () => {
  return (
    <div className="FirstPage">
    <section className="HeroSection">
    <div className="MainDiv">
         <div id="head1"> A little practice. A louder you.</div>
         <div id="head2">Find your words. <br></br>Find your voice.</div>
         <div id="head3">Big interview. Tricky conversation. Everyday hello. Build the confidence to speak up—with an AI companion whos always in your corner..</div>

        <div className="HeroButtons">
         <button id="head4">Find My Starting Level </button>
         <button id="head5">See How It Works </button>
        </div>

         <div id="head6">✓ 3-minute first assessment   ✓ No perfect words needed</div>
    </div>

    <div className="SecondDiv">
        <div id="head7"> Ready when you are. Let’s try together.</div>

         <div className="TokiArea">
            <div className="TokiPlaceholder">
              Toki
            </div>
          </div>

        <div className="Label">
          <div id="head8"> YOUR FIRST SMALL STEP.</div>
          <div id="head9">“Tell me a little about yourself.”</div>
          <div id="head10">A safe space to try. And try again.</div>
        </div>
    </div>
    </section>

    <section className='SecondPage'>
      <div className="Headings">
        <div>Practice out loud</div>
        <div>Real-life role simulations</div>
        <div>Feedback you can use</div>
        <div>Progress at your pace</div>
      </div>
    </section>

    <section className="ThirdDiv">

        <div id="Sec1" className='SmallHead'> REAL LIFE, WITH A REHEARSAL BUTTON.</div>
        <div id="Sec2" className='BigHead'>For the moments that leave you speechless.</div>

        <div className="CardWrapper">
        <div className="CardThirdDiv" id='Card1'>
          <div className="CardTitle">CAREER CONVERSATIONS</div>
          <div className="CardHead">Make your first impression</div>
          <div className="CardPara">Rehearse interviews. Tell your story without losing your train of thought.</div>
        </div>
        <div className="CardThirdDiv" id='Card2'>
          <div className="CardTitle">WORK & LEARNING</div>
          <div className="CardHead">Say the important thing</div>
          <div className="CardPara">Ask your manager for support or talk through a question with your teacher.</div>
        </div>
        <div className="CardThirdDiv" id='Card3'>
          <div className="CardTitle">EVERYDAY CONFIDENCE</div>
          <div className="CardHead">Turn a hello into a conversation</div>
          <div className="CardPara">Ask a stranger for directions. Make a little everyday connection.</div>
        </div>
        </div>

    </section>

    <section className='FourthDiv'>

      <div id="Div1" className='SmallHead'> FROM “WHAT IF” TO “I’VE GOT THIS”</div>
      <div id="Div2"className='BigHead'>Small steps. Real speaking practice.</div>
      <div id="Div3" className='CardPara'>No scripts to memorize. Just a clear path, honest feedback, and another chance to try.</div>
      
      <div className="StepWrapper">
        <div className="Step">
          <div className="StepTitle">01</div>
          <div className="CardHead">Find your starting point</div>
          <div className="CardPara">A short speaking assessment helps us understand your clarity and response speed.</div>
        </div>
        <div className="Step">
          <div className="StepTitle">02</div>
          <div className="CardHead">Make it feel real</div>
          <div className="CardPara">Step into a role. Speak naturally with Toki, your endlessly patient AI companion.</div>
        </div>
        <div className="Step">
          <div className="StepTitle">03</div>
          <div className="CardHead">Grow one level at a time</div>
          <div className="CardPara">Reflect, repeat, and score 70 or higher on a level check to unlock what’s next.</div>
        </div>
      </div>

    </section>

  <section className='FifthDiv'>

    <div className="ColumnWrapper">

    <div className="Column">
    <div id="Div4" className='SmallHead'> YOUR PACE. YOUR PATH.</div>
    <div id="Div5"className='BigHead'>A starting point, not a label.</div>
    <div id="Div6" className='CardPara'>Start at Level 0 and build from there. Your assessment creates a plan around the skills that need a little care—not a one-size-fits-all course.Practice freely. When you’re ready, take a level check. A score of 70/100 unlocks the next level. Need another go? Your current level stays open.</div>
    <button className='WhiteBtn'> Discover my learning path</button>
    </div>

      <div className="LevelThirdDiv">
        <div className="ColumnHead">ILLUSTRATIVE LEARNING PATH</div>
        <div className="Level">
          <div className="LevelTitle">Find your footing</div>
          <div className="LevelHead">Start here · introductions & everyday asks</div>
          <div className="SmallHead">Your starting level</div>
        </div>
        <div className="Level">
          <div className="LevelTitle">Build a clear response</div>
          <div className="LevelHead">Structure your ideas · respond with ease</div>
          <div className="SmallHead">Unlock with 70+</div>
        </div>
        <div className="Level">
          <div className="LevelTitle">Navigate the tricky moments</div>
          <div className="LevelHead">Workplace conversations · active listening</div>
          <div className="SmallHead">Locked until Level 1 check</div>
        </div>
      </div>
    </div>
  </section>

  <section className='SixthDiv'>
      <div className="SixthWrapper">
        <div className="TokiCard">
          <div className="TokiImg"></div>
          <div className="TokiTalk">“Take your time. I’m all ears.”</div>
        </div>
        <div className="OtherCard">
        <div className="SmallHead">MEET TOKI · YOUR VOICE’S BIGGEST FAN</div>
        <div className="BigHead">Not here to judge. Here to help you try.</div>
        <div className="CardPara">A little Cat with a lot of heart. Toki plays your interviewer, your manager, or the friendly stranger—and knows when to switch back to coach.<br></br>
        Patient when you pause.<br></br>
        Specific when you need direction.<br></br>
        Celebrating the effort, not just the score.</div>
        </div>
      </div>
  </section>

  <section className='SeventhDiv'>
    <div className="SeventhWrapper">

      <div className="LeftSide">
       <div className="SmallHead">A FEW THINGS YOU MIGHT WONDER</div>
        <div className="BigHead">Good questions.<br></br><br></br> Honest answers.</div>
        <div className="CardPara">Learning to speak up can feel personal. Here’s what to expect.</div>
      </div>

      <div className="RightSide">

        <div className="Q">
        <div className="Question">Do I need to be a confident speaker to start?</div>
        <div className="Answer">Not at all. Your first assessment finds a comfortable starting point. Level 0 is designed for building the basics, one small conversation at a time.</div>
        </div>
        
        <div className="Q">
        <div className="Question">How do I unlock the next level?</div>
        <div className="Answer">Earn at least 70/100 on your current level check. Practice sessions help you prepare, but only a level check unlocks the next level.</div>
        </div>

        <div className="Q">
        <div className="Question">What does SpeakUp AI evaluate?</div>
        <div className="Answer">Speech clarity and response speed, including the time you take to begin. You’ll also get specific suggestions for structuring your next response.</div>
        </div>

        <div className="Q">
        <div className="Question">Am I speaking to a real person?</div>
        <div className="Answer">You’re practicing with an AI companion. Toki simulates realistic roles, then switches to coach for supportive feedback not professional speech therapy.</div>
        </div>
      </div>
    </div>

  </section>

  <section className='EigthDiv'>

    <div className="EigthWrapper">

        <div className="Footer">
          <div className="logo">SpeakUp AI</div>
          <div className="CardPara">A little practice. A louder you. Your AI-powered communication learning studio.</div>
        </div>
        
        <div className="Footer">
          <div className="SmallHead">EXPLORE</div>
          <div className="BlackText">How it works</div>
          <div className="BlackText">Practice scenarios</div>
          <div className="BlackText">Meet Toki</div>
        </div>

        <div className="Footer">
          <div className="SmallHead">HERE TO HELP</div>
          <div className="BlackText">Help center</div>
          <div className="BlackText">Contact</div>
          <div className="BlackText">Accessibility</div>
        </div>

        <div className="Footer">
          <div className="SmallHead">THE IMPORTANT BITS</div>
          <div className="BlackText">Privacy</div>
          <div className="BlackText">Terms of use</div>
          <div className="BlackText">Microphone & recordings</div>
        </div>
        
    </div>
    
  </section>
  
    </div>
  )
}

export default FirstPage
