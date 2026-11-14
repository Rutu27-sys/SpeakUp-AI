import React, { useState, useEffect } from 'react';
import './Assesment.css';

const Assessment = ({ user, onAssessmentComplete }) => {

  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [transcripts, setTranscripts] = useState({ 1: '', 2: '', 3: '' });
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setTranscripts(prev => ({
            ...prev,
            [currentQuestion]: prev[currentQuestion] ? prev[currentQuestion] + ' ' + final : final
          }));
        }
      };
      recog.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      recog.onend = () => {
        setIsRecording(false);
      };
      setRecognition(recog);
    }
  }, [currentQuestion]);

  const handleStartRecording = () => {
    if (recognition) {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.log('Recognition already started');
      }
    } else {
      setIsRecording(true);
      setTranscripts(prev => ({
        ...prev,
        [currentQuestion]: 'Listening simulation: Tell me a little about yourself...'
      }));
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  const handleReRecord = () => {
    setTranscripts(prev => ({ ...prev, [currentQuestion]: '' }));
    setIsRecording(false);
  };

  const currentTranscript = transcripts[currentQuestion];
  const getQuestionPrompt = () => {
    if (currentQuestion === 1) return '“Hi! Tell me a little about yourself and something you enjoy doing.”';
    if (currentQuestion === 2) return '“Considering we are strangers. Can you ask directions for nearest metro station ?”';
    return '“Tell me about a time you needed help with a difficult task and how you asked for it.”';
  };
  const handleFinishAssessment = async () => {
  try {
    const userId = user?.userId || user?._id || user?.id || localStorage.getItem('userId');

    if (!userId) {
      alert('User ID missing. Please log in again.');
      return;
    }
    const response = await fetch('http://localhost:5000/api/evaluate-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, transcripts })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      alert(`Server error (${response.status}): Could not evaluate assessment.`);
      return;
    }
    const data = await response.json();
    alert(`Toki says: ${data.evaluation.feedback}`);
    onAssessmentComplete();
  } catch (err) {
    console.error('Error submitting assessment:', err);
  }
};

  return (
    <div className='AssementPage' id='AssesmentPage'>

      <div className="AssesmentNav">
        <div className="AssesmentLogo">SpeakUp AI</div>
        <div className="AssesmentSmallText">STARTING POINT · ABOUT 3 MINUTES</div>
        <button className='SaveAndExit'>Save & exit</button>
      </div>

      <div className="TopProgressBar">
        <div className={`StepIndicator ${currentQuestion === 1 ? 'active' : ''}`}>1. Introduce yourself </div>
        <div className={`StepIndicator ${currentQuestion === 2 ? 'active' : ''}`}>2. Ask for directions </div>
        <div className={`StepIndicator ${currentQuestion === 3 ? 'active' : ''}`}>3. Ask for support </div>
      </div>

      <div className="AssesmentText">
        <div className="AssesmentBlueText">LET’S FIND YOUR STARTING POINT</div>
        <div className="AssesmentBlackText" id='AssementHeadText'>First, just be yourself.</div>
        <div className="AssesmentGreyText">Three short responses. No pass or fail. This helps Toki build a plan around your voice.</div>
      </div>

      <div className="AssesmentPageGrid">
        <div className="AssesmentLeftPanel">
          <div className="AssesmentTokiCard">
            <div className="AssesmentBlueText">QUESTION {currentQuestion} OF 3</div>
            <div className="AssesmentTokiImg"></div>
            <div className="AssesmentBlackText" id='AssesmentCardHead'>
              {getQuestionPrompt()}
            </div>
            <div className="AssesmentGreyText">Imagine we’ve just met at a class. A few sentences are plenty.</div>
          </div>

          <div className="ListeningCard">
            <div className="Microphone">
              {isRecording ? '🔴 Microphone active · Recording...' : '🟢 Microphone connected · Ready'}
            </div>

            <div className={`VoiceWaveExpanded ${isRecording ? 'active' : ''}`}>
              {currentTranscript ? (
                <div className="FullTranscriptBox">
                  <span className="TranscriptLabel">What you've said:</span>
                  <p className="LiveTranscriptText">{currentTranscript}</p>
                </div>
              ) : (
                <div className="WaveBarsContainer">
                  {[...Array(14)].map((_, i) => (
                    <span key={i} className={`WaveBar ${isRecording ? 'animate' : ''}`}></span>
                  ))}
                </div>
              )}
            </div>

            <div className="ButtonRow">
              <button  className='StartRecording'  onClick={handleStartRecording} disabled={isRecording} >Start Recording</button>
              <button className='StopRecording' onClick={handleStopRecording} disabled={!isRecording}>Stop Recording</button>
              {currentTranscript && !isRecording && (
                <button className='ReRecordBtn' onClick={handleReRecord}>Re-record ↺</button>
              )}
            </div>

            <div className="AssesmentGreyText">
              Recording starts only when you press the microphone. Review or re-record your answer before continuing.
            </div>
          </div>
        </div>

        <div className="AssesmentRightPanel">
          <div className="AssesmentNote">
            <div className="AssesmentBlueText">A NOTE FROM TOKI</div>
            <div className="AssesmentBlackText">Not a test. A hello.</div>
            <div className="AssesmentGreyText">Pause if you need to. Use your own words. There isn’t a “right” personality or accent here.</div>
            
            <div className="AssesmentBlackText" style={{ fontSize: '15px' }}>What we’ll notice</div>
            <div className="AssesmentGreyText">
              1. Clarity: how easily your ideas come through.<br />
              2. Response speed: how long it takes to begin speaking.
            </div>

            <div className="Yellowcard">
              <div className="AssesmentBlueText">YOUR MIC, YOUR CONTROL</div>
              <div className="AssesmentGreyText">
                Ready → Start recording<br />
                Recording → Stop & review<br />
                Review → Re-record or continue
              </div>
            </div>

            <div className="QuestionNavRow">
              {currentQuestion > 1 && (
                <button className='PrevQuestion' onClick={() => setCurrentQuestion(prev => Math.max(prev - 1, 1))}> ← Prev
                </button>
              )}
              <button className='NextQuestion' onClick={() => {
                  if (currentQuestion === 3) {
                  handleFinishAssessment();}
                  else { setCurrentQuestion(prev => prev + 1); }
              }} >
              {currentQuestion === 3 ? 'Finish Assessment →' : 'Next question →'}
             </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Assessment;