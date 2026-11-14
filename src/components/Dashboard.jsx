import React, { useState, useEffect } from 'react';
import ChatStudio from './ChatStudio';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(user || null);
  const [activeNav, setActiveNav] = useState('learning'); 
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null); 

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = user?.userId || user?._id || localStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await fetch(`http://localhost:5000/api/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleOpenScenario = (scenarioObj = null) => {
    setSelectedScenario(scenarioObj);
    setActiveNav('scenarios');
  };

  const initials = profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'SU';
  const historyList = profile?.completedScenarios || [];

  return (
    <div className="AppLayout">
      <aside className="AppSidebar">
        <div>
          <div className="SidebarLogoArea">
            <span className="SidebarLogoBadge">💬</span>
            <span className="SidebarLogoText">SpeakUp AI</span>
          </div>

          <div className="SidebarNavGroup">
            <div className="SidebarGroupTitle">YOUR LEARNING STUDIO</div>
            <button className={`SidebarNavItem ${activeNav === 'learning' ? 'active' : ''}`} onClick={() => setActiveNav('learning')} > ⊞ My learning </button>
            <button className={`SidebarNavItem ${activeNav === 'scenarios' ? 'active' : ''}`} onClick={() => handleOpenScenario(null)} > 🧭 Role scenarios </button>
            <button className={`SidebarNavItem ${activeNav === 'growth' ? 'active' : ''}`} onClick={() => setActiveNav('growth')}> 📈 My growth </button>
          </div>

          <div className="TokiSidebarCard">
            <div className="TokiCardAvatar">🍇</div>
            <div className="TokiCardContent">
              <strong>A little practice.<br />A louder you.</strong>
              <p>Your next small step is a big deal. I'm here for it.</p>
              <span className="TokiSig">— Toki, your speaking coach</span>
            </div>
          </div>
        </div>

        <div className="SidebarFooterGroup">

          <div className="SidebarUserProfile" onClick={onLogout} title="Click to log out">
            <div className="UserAvatarBubble">{initials}</div>
            <div className="UserInfoText">
              <span className="UserName">{profile?.username || 'Speaker'}</span>
              <span className="UserSubText">Personal learning plan</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="AppMainContent">
        {activeNav === 'scenarios' ? (
        <ChatStudio
               user={profile}
               onUserUpdate={(updated) => setProfile(updated)}
               onBackToLearning={() => setActiveNav('learning')}
               onViewGrowth={() => setActiveNav('growth')} />  ) : activeNav === 'growth' ? (
          <div className="GrowthPageContainer">
            <div className="GrowthHeader">
              <h2>Your Speaking Growth Over Time</h2>
              <p>Review your clarity scores, session history, and detailed feedback from past practices.</p>
            </div>

            <div className="GrowthMetricsGrid">
              <div className="MetricCard">
                <span className="MetricLabel">Current Clarity Score</span>
                <div className="MetricValue">{profile?.score ?? 78}<span> /100</span></div>
                <span className="MetricDetail unlocked">📈 Active evaluation score</span>
              </div>
              <div className="MetricCard">
                <span className="MetricLabel">Completed Sessions</span>
                <div className="MetricValue">{historyList.length}</div>
                <span className="MetricDetail">Total roleplay attempts</span>
              </div>
              <div className="MetricCard">
                <span className="MetricLabel">Current Milestone</span>
                <div className="MetricValue">Level {profile?.currentLevel ?? 0}</div>
                <span className="MetricDetail unlocked">Progress: {profile?.levelPasses ?? 0}/3 passed</span>
              </div>
            </div>

            <div className="GrowthHistoryCard">
              <h3>All Practice Sessions & Results</h3>
              {historyList.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '1rem' }}>
                  No practice sessions recorded yet. Head over to <strong>Role scenarios</strong> to complete your first session!
                </p>  ) : (
                <div className="StepsList" style={{ marginTop: '1rem' }}>
                  {historyList.reverse().map((item, idx) => (
                    <div key={idx} className="StepItem" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="StepCheckIcon" style={{ background: item.passed ? '#dcfce7' : '#fee2e2', color: item.passed ? '#15803d' : '#dc2626' }}>
                          {item.passed ? '✓' : '✕'}
                        </div>
                        <div className="StepInfo">
                          <strong>{item.title}</strong>
                          <span>Level {item.level} • {new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div className="StepScoreBadge">
                          {item.score}/100<br />
                          <small style={{ color: item.passed ? '#15803d' : '#dc2626' }}>
                            {item.passed ? 'Passed' : 'Failed'}
                          </small>
                        </div>
                        <button className="SecondaryOutlineBtn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}onClick={() => setSelectedHistoryItem(item)} > View feedback </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedHistoryItem && (
              <div className="ModalOverlay" onClick={() => setSelectedHistoryItem(null)}>
                <div className="ModalContent" onClick={(e) => e.stopPropagation()}>
                  <div className="FeedbackHeaderBadge">SESSION FEEDBACK REVIEW</div>
                  <h3>{selectedHistoryItem.title}</h3>
                  <div className="ScoreBigNum" style={{ fontSize: '1.75rem', margin: '0.5rem 0' }}>
                    {selectedHistoryItem.score}<span>/100</span>
                    <span style={{ fontSize: '0.85rem', marginLeft: '0.75rem', color: selectedHistoryItem.passed ? '#15803d' : '#dc2626' }}>
                      ({selectedHistoryItem.passed ? 'Passed' : 'Failed'})
                    </span>
                  </div>
                  <p style={{ marginTop: '0.75rem' }}><strong>🗣️ Clarity & Grammar:</strong> {selectedHistoryItem.speechClarity || 'Recorded during session evaluation.'}</p>
                  <p style={{ marginTop: '0.5rem' }}><strong>🤝 Politeness & Tone:</strong> {selectedHistoryItem.politenessAndTone || 'Maintained conversational flow.'}</p>
                  <p style={{ marginTop: '0.5rem' }}><strong>🎯 Improvement Advice:</strong> {selectedHistoryItem.improvement || 'Keep practicing full sentences.'}</p>
                  <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button className="PrimaryPurpleBtn" onClick={() => setSelectedHistoryItem(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div> ) : (
          <>
            <header className="MainTopBar">
              <div className="Breadcrumb">My learning / Your studio</div>
              <div className="TopBarRight">
                <div className="StreakPill">⚡ 2-day practice streak</div>
              </div>
            </header>

            <section className="DashboardHeroArea">
              <div className="HeroDateText">THURSDAY, NOVEMBER 12</div>
              <h1 className="HeroGreeting">Good to hear you, {profile?.username || 'Speaker'}.</h1>
              <p className="HeroSubText">You’ve built a foundation. Now let’s make your next response a little clearer.</p>

              <div className="MetricsRow">
                <div className="MetricCard level-tint">
                  <span className="MetricLabel">Current level</span>
                  <div className="MetricValue">Level {profile?.currentLevel ?? 0}</div>
                  <span className="MetricDetail unlocked">Progress: {profile?.levelPasses ?? 0}/3 passes</span>
                </div>
                <div className="MetricCard">
                  <span className="MetricLabel">Latest clarity score</span>
                  <div className="MetricValue">{profile?.score ?? 78} / 100</div>
                  <span className="MetricDetail">Evaluated performance</span>
                </div>
                <div className="MetricCard">
                  <span className="MetricLabel">Practice sessions</span>
                  <div className="MetricValue">{historyList.length} completed</div>
                  <span className="MetricDetail">Endless course active</span>
                </div>
              </div>

              <div className="DashboardGridColumns">
                <div className="LeftColumnFlow">
                  <div className="FeaturedHeroBanner">
                    <div className="BannerTextContent">
                      <span className="BannerTag">YOUR NEXT SMALL STEP • LEVEL {profile?.currentLevel ?? 0}</span>
                      <h2>Build clear and confident English.</h2>
                      <p>Practice unscripted roleplay scenarios with Toki tailored to your active level.</p>
                      <div className="BannerMeta">
                        <span>3 min</span> • <span>Interactive chat</span>
                      </div>
                      <button className="StartBannerBtn" onClick={() => handleOpenScenario(null)}>
                        Start Role Scenario →
                      </button>
                    </div>
                    <div className="BannerGraphic">🍇</div>
                  </div>

                  <div className="LatestStepsSection">
                    <div className="SectionHeaderRow">
                      <h3>Your latest steps</h3>
                      <span className="ViewAllLink" onClick={() => setActiveNav('growth')}>
                        View all growth ↗
                      </span>
                    </div>

                    <div className="StepsList">
                      {historyList.length === 0 ? (
                        <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.88rem' }}>
                          No sessions yet. Click "Role scenarios" to begin!
                        </div> ) : (
                        historyList.slice(-3).reverse().map((item, idx) => (
                          <div key={idx} className="StepItem">
                            <div className="StepCheckIcon" style={{ background: item.passed ? '#dcfce7' : '#fee2e2', color: item.passed ? '#15803d' : '#dc2626' }}>
                              {item.passed ? '✓' : '✕'}
                            </div>
                            <div className="StepInfo">
                              <strong>{item.title}</strong>
                              <span>Level {item.level} • {new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            <div className="StepScoreBadge">{item.score}/100<br /><small>{item.passed ? 'Passed' : 'Failed'}</small></div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="RightColumnPath">
                  <div className="PathHeaderRow">
                    <h3>Your learning path</h3>
                    <span className="PathIcon">⇄</span>
                  </div>
                  <p className="PathSubHeader">Pass 3 scenarios per level to unlock higher tiers.</p>

                  <div className="PathStepsList">
                    <div className="PathStepCard passed">
                      <div className="PathNumCircle">0</div>
                      <div className="PathStepDetails">
                        <div className="PathTitleRow">
                          <strong>Foundational Clarity</strong>
                          <span className="CheckMark">✓</span>
                        </div>
                        <p>Everyday interactions & asks</p>
                        <span className="PathStatus passed">Active / Passed</span>
                      </div>
                    </div>

                    <div className="PathStepCard active">
                      <div className="PathNumCircle">1</div>
                      <div className="PathStepDetails">
                        <div className="PathTitleRow">
                          <strong>Social & Institutional</strong>
                          <span className="PlayIcon">▷</span>
                        </div>
                        <p>Campus & formal requests</p>
                        <span className="PathStatus active">Current Tier</span>
                      </div>
                    </div>

                    <div className="PathStepCard locked">
                      <div className="PathNumCircle">2</div>
                      <div className="PathStepDetails">
                        <div className="PathTitleRow">
                          <strong>Job Interviews & Career</strong>
                          <span className="LockIcon">🔒</span>
                        </div>
                        <p>Behavioral & professional Q&A</p>
                        <span className="PathStatus locked">Locked</span>
                      </div>
                    </div>
                  </div>

                  <p className="PathFooterNote">
                    Only level checks unlock the next level. A practice score helps you learn, not skip ahead.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;