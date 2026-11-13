import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const CHAT_LEVELS = [
  { id: 'Level 1', label: '🌱 Level 1: Everyday Situations (Coffee, Directions)' },
  { id: 'Level 2', label: '📚 Level 2: Academic & Institutional (Missing Exams)' },
  { id: 'Level 3', label: '💼 Level 3: Professional & Career Interviews' }
];

const ChatStudio = ({ user, onBackToLearning }) => {
  const [selectedLevel, setSelectedLevel] = useState('Level 1');
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
  const loadNewScenario = async (lvl) => {
    setIsGenerating(true);
    setSessionFeedback(null);
    setMessages([]);
    setSessionSeconds(0);

    try {
      const res = await fetch('http://localhost:5000/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: lvl || selectedLevel })
      });
      const data = await res.json();
      setScenario(data);
      setMessages([
        { sender: 'toki', text: data.starter, tip: 'Respond in character to Toki.' }
      ]);
    } catch (err) {
      console.error('Failed to generate scenario:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    loadNewScenario('Level 1');
  }, []);
  useEffect(() => {
    if (sessionFeedback || isGenerating) return;
    const timer = setInterval(() => setSessionSeconds(p => p + 1), 1000);
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
        setInputText(prev => prev ? `${prev} ${spoken}` : spoken);
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
      alert('Speech recognition is not supported in this browser. Please type your reply.');
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
          scenarioDescription: scenario?.description || 'General conversation practice',
          message: userMsg.text,
          history: updatedHistory
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { sender: 'toki', text: data.reply, tip: data.tip }]);
      } else {
        setMessages(prev => [...prev, { sender: 'toki', text: 'Could you rephrase that? Let us keep the conversation going.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (messages.length <= 1) {
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
          scenarioTitle: scenario?.title,
          scenarioDescription: scenario?.description,
          history: messages
        })
      });
      const data = await res.json();
      setSessionFeedback(data);

      setMessages(prev => [
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
          Role scenarios / <strong>{scenario?.title || 'Loading Scenario...'}</strong>
        </div>
        <div className="TopBarRight">
          <div className="StreakPill">⚡ 2-day practice streak</div>
          <button className="BellBtn">🔔</button>
          <div className="StatusGreenDot"></div>
        </div>
      </header>
      <div className="ScenarioTopHeader">
        <div>
          <div className="ScenarioLevelTag">AI ROLEPLAY SIMULATION • {selectedLevel}</div>
          <h1 className="ScenarioMainTitle">{scenario?.title || 'Generating Scenario...'}</h1>
          <p className="ScenarioSubNote">
            <strong>Situation:</strong> {scenario?.description || 'Please wait while Toki sets up your roleplay context.'}
          </p>
        </div>

        <button className="EndSessionBtn" onClick={handleEndSession} disabled={isEndingSession || sessionFeedback || isGenerating}>
          {isEndingSession ? 'Evaluating...' : 'End session & Get Score ↪'}
        </button>
      </div>

      <div className="ScenarioStepperRow">
        <div className="LevelSelectorPills">
          {CHAT_LEVELS.map(lvl => (
            <button
              key={lvl.id}
              className={`LevelTabBtn ${selectedLevel === lvl.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedLevel(lvl.id);
                loadNewScenario(lvl.id);
              }}
            >
              {lvl.label}
            </button>
          ))}
        </div>
        <div className="SessionTimerText">Session time {formatTime(sessionSeconds)}</div>
      </div>

      <div className="RoleWorkspaceGrid">
        <div className="CenterChatCard">
          <div className="CenterChatScrollArea" style={{ maxHeight: '425px' }}>
            {isGenerating ? (
              <div className="ChatWelcomeHero">
                <div className="GlowingOrb"></div>
                <div className="WelcomeHello">Toki is setting up your scenario...</div>
                <p className="WelcomeStarterQuote">Preparing unscripted conversational practice.</p>
              </div>
            ) : (
              <div className="ActiveChatStream">
                {messages.map((msg, i) => (
                  <div key={i} className={`CleanMsgRow ${msg.sender}`}>
                    {msg.isFeedbackCard ? (
                      <div className="ChatFeedbackCard">
                        <div className="FeedbackHeaderBadge">🎓 STRICT COACH EVALUATION</div>
                        <h3>{msg.feedback.passed ? '🎉 Passed Scenario!' : '⚠️ Needs Improvement'}</h3>
                        <div className="ScoreBigNum">{msg.feedback.score}<span>/100</span></div>
                        <p><strong>Clarity & Grammar:</strong> {msg.feedback.speechClarity}</p>
                        <p><strong>✨ Strength:</strong> {msg.feedback.strength}</p>
                        <p><strong>🎯 What to Improve:</strong> {msg.feedback.improvement}</p>
                        <p><strong>Verdict:</strong> {msg.feedback.summary}</p>
                        <div className="FeedbackCardActions">
                          <button className="PrimaryPurpleBtn" onClick={() => loadNewScenario(selectedLevel)}>
                            Try Another Scenario 🎲
                          </button>
                          <button className="SecondaryOutlineBtn" onClick={onBackToLearning}>
                            Back to Dashboard
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="CleanMsgBubble">
                        <span className="CleanMsgSender">{msg.sender === 'toki' ? 'Toki (In Character)' : 'You'}</span>
                        <p>{msg.text}</p>
                        {msg.tip && <div className="InlineCoachNote">💡 {msg.tip}</div>}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && <div className="TokiThinkingPulse">Toki is replying...</div>}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {!sessionFeedback && !isGenerating && (
            <form className="CleanComposerBox" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your in-character response or speak with the microphone..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
              <div className="ComposerToolbar">
                <div className="ComposerLeftTools">
                  <button
                    type="button"
                    className={`VoicePillBtn ${isRecording ? 'recording' : ''}`}
                    onClick={toggleMic}
                  >
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

        {/* RIGHT SIDEBAR GUIDE */}
        <aside className="RightFocusColumn">
          <div className="FocusLimeCard">
            <span className="FocusEyebrow">ROLEPLAY INSTRUCTIONS</span>
            <h3>How to practice</h3>
            <p className="FocusDescription">
              Read the scenario description at the top. Respond naturally to Toki just like you would in a real conversation.
            </p>
            <div className="FocusDivider" />
            <div className="FocusStepsList">
              <div className="FocusStepRow">
                <span className="FocusStepNum">1</span>
                <div><strong>Stay in character</strong><p>Address Toki's questions directly.</p></div>
              </div>
              <div class="FocusStepRow">
                <span className="FocusStepNum">2</span>
                <div><strong>Strict evaluation</strong><p>Short or vague answers will result in lower scores.</p></div>
              </div>
              <div className="FocusStepRow">
                <span className="FocusStepNum">3</span>
                <div><strong>Level up</strong><p>Pass scenarios with 70+ to advance your speaking fluency.</p></div>
              </div>
            </div>
          </div>

          <div className="PauseReassuranceCard">
            <div className="PauseTitle">💜 Natural & Dynamic</div>
            <p>Every session generates a brand new unscripted challenge tailored to your chosen level.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ChatStudio;