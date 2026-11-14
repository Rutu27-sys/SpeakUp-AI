import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const ChatStudio = ({ user, onUserUpdate, onBackToLearning, onViewGrowth }) => {
  const unlockedLevel = user?.currentLevel ?? 0;
  const currentPasses = user?.levelPasses ?? 0;
  const REQUIRED_PASSES = 3;

  const [activeLevel, setActiveLevel] = useState(unlockedLevel);
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionFeedback, setSessionFeedback] = useState(null);
  const [isEndingSession, setIsEndingSession] = useState(false);

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const levelTabs = Array.from({ length: Math.max(4, unlockedLevel + 2) }, (_, idx) => idx);
  const loadRandomScenario = async (targetLvl = activeLevel) => {
    setIsGenerating(true);
    setSessionFeedback(null);
    setMessages([]);
    setSessionSeconds(0);
    try {
      const userId = user?._id || user?.userId || localStorage.getItem('userId');
      const res = await fetch('http://localhost:5000/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, requestedLevel: targetLvl })
      });
      const data = await res.json();
      setScenario(data);
      setMessages([
        {
          sender: 'toki',
          text: data.starter,
          tip: `You are speaking with: ${data.persona || 'Toki'}. Reply naturally in full sentences.`
        }
      ]);
    } catch (err) {
      console.error('Failed to generate scenario:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    loadRandomScenario(unlockedLevel);
  }, []);

  useEffect(() => {
    if (sessionFeedback || isGenerating) return;
    const timer = setInterval(() => setSessionSeconds((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [sessionFeedback, isGenerating]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${spoken}` : spoken));
      };
      recog.onend = () => setIsRecording(false);
      recog.onerror = () => setIsRecording(false);
      recognitionRef.current = recog;
    }
  }, []);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Type your response below.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const userMsg = { sender: 'user', text: inputText.trim() };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioDescription: scenario?.description,
          persona: scenario?.persona,
          message: userMsg.text,
          history: updatedHistory
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { sender: 'toki', text: data.reply, tip: data.tip }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'toki', text: data.error || 'Could you repeat that clearly?' }
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (messages.filter((m) => m.sender === 'user').length === 0) {
      onBackToLearning();
      return;
    }
    setIsEndingSession(true);
    try {
      const userId = user?._id || user?.userId || localStorage.getItem('userId');
      const res = await fetch('http://localhost:5000/api/end-session-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          level: activeLevel,
          scenarioTitle: scenario?.title,
          scenarioDescription: scenario?.description,
          history: messages
        })
      });
      const data = await res.json();
      setSessionFeedback(data);
      if (data.user && onUserUpdate) {
        onUserUpdate(data.user);
      }
      if (data.levelUnlocked && data.user) {
        setActiveLevel(data.user.currentLevel);
      }
      setMessages((prev) => [
        ...prev,
        {
          sender: 'toki',
          isFeedbackCard: true,
          feedback: data
        }
      ]);
    } catch (err) {
      console.error('End session error:', err);
    } finally {
      setIsEndingSession(false);
    }
  };

  return (
    <div className="RoleStudioWrapper">
      <header className="MainTopBar">
        <div className="Breadcrumb">
          Role scenarios / Level {activeLevel} / <strong>{scenario?.title || 'Generating...'}</strong>
        </div>
        <div className="TopBarRight">
          <div className="StreakPill">
            🎯 Level {unlockedLevel} Progress: {currentPasses}/{REQUIRED_PASSES} passed
          </div>
        </div>
      </header>
      
      <div className="ScenarioTopHeader">
        <div>
          <div className="ScenarioLevelTag">
            LEVEL {activeLevel} • CHARACTER: {scenario?.persona?.toUpperCase() || 'TOKI'}
          </div>
          <h1 className="ScenarioMainTitle">{scenario?.title || 'Preparing random scenario...'}</h1>
          <p className="ScenarioSubNote">
            <strong>Situation:</strong> {scenario?.description}
          </p>
        </div>

        <button className="EndSessionBtn"onClick={handleEndSession} disabled={isEndingSession || Boolean(sessionFeedback) || isGenerating}> {isEndingSession ? 'Grading speech...' : 'End session & Evaluate ↪'} </button>
      </div>

      <div className="ScenarioStepperRow">
        <div className="LevelSelectorPills">
          {levelTabs.map((lvl) => {
            const isLocked = lvl > unlockedLevel;
            return (
              <button key={lvl} disabled={isLocked} className={`LevelTabBtn ${activeLevel === lvl ? 'active' : ''}`}
                style={{ opacity: isLocked ? 0.55 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }} onClick={() => {
                  if (!isLocked) {
                    setActiveLevel(lvl);
                    loadRandomScenario(lvl);
                  }
                }} >
                {isLocked ? `🔒 Level ${lvl}` : `Level ${lvl}`} </button>
            );
          })}
        </div>

        <div className="SessionTimerText">
          ⏱ {formatTime(sessionSeconds)} / 03:00 target
        </div>
      </div>

      <div className="RoleWorkspaceGrid">
        <div className="CenterChatCard">
          <div className="CenterChatScrollArea" style={{ maxHeight: '430px' }}>
            {isGenerating ? (
              <div className="ChatWelcomeHero">
                <div className="GlowingOrb"></div>
                <div className="WelcomeHello">Toki is creating a random Level {activeLevel} scenario...</div>
                <p className="WelcomeStarterQuote">Every session adapts to your speaking level.</p>
              </div>
            ) : (
              <div className="ActiveChatStream">
                {messages.map((msg, i) => (
                  <div key={i} className={`CleanMsgRow ${msg.sender}`}>
                    {msg.isFeedbackCard ? (
                      <div className="ChatFeedbackCard">
                        <div className="FeedbackHeaderBadge">
                          {msg.feedback.passed ? '✅ SCENARIO PASSED (70+)' : '❌ BELOW PASS MARK (70 REQUIRED)'}
                        </div>
                        <h3>
                          {msg.feedback.levelUnlocked
                            ? `🎊 Congrats! You unlocked Level ${msg.feedback.user?.currentLevel}!`
                            : msg.feedback.passed
                            ? `Congrats! You passed (${msg.feedback.user?.levelPasses ?? currentPasses}/${REQUIRED_PASSES} toward Level ${activeLevel + 1})`
                            : 'Keep practicing — pass 3 scenarios to unlock the next level'}
                        </h3>
                        <div className="ScoreBigNum">
                          {msg.feedback.score}
                          <span>/100</span>
                        </div>
                        <p><strong>🗣️ Clarity & Grammar:</strong> {msg.feedback.speechClarity}</p>
                        <p><strong>🤝 Politeness & Tone:</strong> {msg.feedback.politenessAndTone}</p>
                        <p><strong>🎯 How to Improve:</strong> {msg.feedback.improvement}</p>
                        <p><strong>Verdict:</strong> {msg.feedback.summary}</p>
                        <div className="FeedbackCardActions" style={{ display: 'flex', gap: '0.75rem' }}>
                          <button className="PrimaryPurpleBtn" onClick={() => loadRandomScenario(msg.feedback.user?.currentLevel ?? activeLevel)} >
                            Next Random Scenario →
                          </button>
                          <button className="SecondaryOutlineBtn" onClick={onViewGrowth || onBackToLearning} >
                            View Growth
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="CleanMsgBubble">
                        <span className="CleanMsgSender">
                          {msg.sender === 'toki' ? scenario?.persona || 'Toki' : 'You'}
                        </span>
                        <p>{msg.text}</p>
                        {msg.tip && <div className="InlineCoachNote">💡 {msg.tip}</div>}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && <div className="TokiThinkingPulse">{scenario?.persona || 'Toki'} is responding...</div>}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {!sessionFeedback && !isGenerating && (
            <form className="CleanComposerBox" onSubmit={handleSendMessage}>
              <input type="text"
                placeholder={`Reply in character to ${scenario?.persona || 'Toki'}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)} />
              <div className="ComposerToolbar">
                <div className="ComposerLeftTools">
                  <button
                    type="button"
                    className={`VoicePillBtn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleMic} >
                    {isRecording ? '⏹ Stop' : '🎤 Speak'}
                  </button>
                </div>
                <button type="submit" className="OrbSendBtn" disabled={isLoading || !inputText.trim()}>
                  ↑
                </button>
              </div>
            </form>
          )}
        </div>
        
        <aside className="RightFocusColumn">
          <div className="FocusLimeCard">
            <span className="FocusEyebrow">LEVEL {activeLevel} UNLOCK RULE</span>
            <h3>Pass 3 scenarios with 70+</h3>
            <p className="FocusDescription">
              Complete 3 unique scenarios in Level {activeLevel} with at least 70/100 to unlock Level {activeLevel + 1}.
            </p>
            <div className="FocusDivider" />
            <div className="FocusStepsList">
              <div className="FocusStepRow">
                <span className="FocusStepNum">1</span>
                <div><strong>Speak in full sentences</strong><p>Avoid one-word replies; explain your reasoning clearly.</p></div>
              </div>
              <div className="FocusStepRow">
                <span className="FocusStepNum">2</span>
                <div><strong>Polite & natural tone</strong><p>Match your tone to the character you are speaking with.</p></div>
              </div>
              <div className="FocusStepRow">
                <span className="FocusStepNum">3</span>
                <div><strong>3-minute target</strong><p>Aim for 3–4 thoughtful exchanges before ending the session.</p></div>
              </div>
            </div>
          </div>

          <div className="PauseReassuranceCard">
            <div className="PauseTitle">📈 Endless Progression</div>
            <p>Each level automatically scales difficulty from everyday basics to executive interviews.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatStudio;