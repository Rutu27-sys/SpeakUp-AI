import React, { useState, useEffect } from 'react';
import ChatStudio from './ChatStudio';
import './Dashboard.css';

const SCENARIOS = [
  {
    id: 'project',
    category: 'Portfolio & Tech',
    title: 'Talking about your recent project',
    focusTitle: 'Share what you built & what you learned.',
    focusDesc: 'Discuss your tech stack, animations, or architecture naturally as if speaking to a peer.',
    starter: "Hey! How is the project you were working on going?"
  },
  {
    id: 'interview',
    category: 'Job Interview',
    title: 'Introduce yourself',
    focusTitle: 'One point. One real example.',
    focusDesc: 'Lead with your main contribution and back it up with details.',
    starter: "Hi! Thanks for jumping on. Can you share a quick introduction and walk me through a challenge you solved recently?"
  },
  {
    id: 'coffee',
    category: 'Everyday Confidence',
    title: 'Ordering at a busy café',
    focusTitle: 'Clear request. Calm pace.',
    focusDesc: 'State your order clearly without rushing.',
    starter: "Hi there! Welcome in. What can I get started for you today?"
  }
];

const Dashboard = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(user || null);
  const [activeNav, setActiveNav] = useState('learning'); 
  const [selectedScenario, setSelectedScenario] = useState(null);

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
            <button
              className={`SidebarNavItem ${activeNav === 'learning' ? 'active' : ''}`}
              onClick={() => setActiveNav('learning')}
            >
              ⊞ My learning
            </button>
            <button
              className={`SidebarNavItem ${activeNav === 'scenarios' ? 'active' : ''}`}
              onClick={() => handleOpenScenario(null)}
            >
              🧭 Role scenarios
            </button>
            <button
              className={`SidebarNavItem ${activeNav === 'growth' ? 'active' : ''}`}
              onClick={() => setActiveNav('growth')}
            >
              📈 My growth
            </button>
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
          <button className="SidebarFooterItem">❓ Help & feedback</button>
          <button className="SidebarFooterItem">⚙️ Settings</button>

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
            initialScenario={selectedScenario}
            onBackToLearning={() => setActiveNav('learning')}
          />
        ) : activeNav === 'growth' ? (
          <div className="GrowthPageContainer">
            <div className="GrowthHeader">
              <h2>Your Speaking Growth Over Time</h2>
              <p>Tracking your clarity score, session frequency, and level progressions.</p>
            </div>

            <div className="GrowthMetricsGrid">
              <div className="MetricCard">
                <span className="MetricLabel">Current Clarity Score</span>
                <div className="MetricValue">{profile?.score ?? 78}<span> /100</span></div>
                <span className="MetricDetail unlocked">📈 +12 pts since baseline</span>
              </div>
              <div className="MetricCard">
                <span className="MetricLabel">Completed Sessions</span>
                <div className="MetricValue">5</div>
                <span className="MetricDetail">Across role scenarios</span>
              </div>
              <div className="MetricCard">
                <span className="MetricLabel">Current Milestone</span>
                <div className="MetricValue">{profile?.currentLevel || 'Level 1'}</div>
                <span className="MetricDetail unlocked">Active practice tier</span>
              </div>
            </div>

            <div className="GrowthHistoryCard">
              <h3>Recent Practice Sessions</h3>
              <div className="StepsList" style={{ marginTop: '1rem' }}>
                <div className="StepItem">
                  <div className="StepCheckIcon">✓</div>
                  <div className="StepInfo">
                    <strong>Talking about your recent project</strong>
                    <span>Today • Role scenario</span>
                  </div>
                  <div className="StepScoreBadge">{profile?.score ?? 82}/100<br/><small>Passed</small></div>
                </div>
                <div className="StepItem">
                  <div className="StepCheckIcon">✓</div>
                  <div className="StepInfo">
                    <strong>Introduce yourself</strong>
                    <span>Nov 3 • Level 1 Check</span>
                  </div>
                  <div className="StepScoreBadge">78/100<br/><small>Passed</small></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header className="MainTopBar">
              <div className="Breadcrumb">My learning / Your studio</div>
              <div className="TopBarRight">
                <div className="StreakPill">⚡ 2-day practice streak</div>
                <button className="BellBtn">🔔</button>
                <div className="StatusGreenDot"></div>
              </div>
            </header>

            <section className="DashboardHeroArea">
              <div className="HeroDateText">THURSDAY, NOVEMBER 12</div>
              <h1 className="HeroGreeting">Good to hear you, {profile?.username || 'Speaker'}.</h1>
              <p className="HeroSubText">You’ve built a foundation. Now let’s make your next response a little clearer.</p>

              <div className="MetricsRow">
                <div className="MetricCard level-tint">
                  <span className="MetricLabel">Current level</span>
                  <div className="MetricValue">{profile?.currentLevel || 'Level 1'}</div>
                  <span className="MetricDetail unlocked">Unlocked • Build a clear response</span>
                </div>
                <div className="MetricCard">
                  <span className="MetricLabel">Latest level check</span>
                  <div className="MetricValue">{profile?.score ?? 78} / 100</div>
                  <span className="MetricDetail">Level 0 passed • 70 required</span>
                </div>
                <div className="MetricCard">
                  <span className="MetricLabel">Practice time</span>
                  <div className="MetricValue">24 min</div>
                  <span className="MetricDetail">4 sessions • 2-day streak</span>
                </div>
              </div>

              <div className="DashboardGridColumns">
                <div className="LeftColumnFlow">
                  <div className="FeaturedHeroBanner">
                    <div className="BannerTextContent">
                      <span className="BannerTag">YOUR NEXT SMALL STEP • {profile?.currentLevel || 'LEVEL 1'}</span>
                      <h2>Tell your story, one point at a time.</h2>
                      <p>Practice talking about your recent projects and tech stack with Toki.</p>
                      <div className="BannerMeta">
                        <span>3 min</span> • <span>Interactive chat</span>
                      </div>
                      <button
                        className="StartBannerBtn"
                        onClick={() => handleOpenScenario(SCENARIOS[0])}
                      >
                        Start "Talking about your project" →
                      </button>
                    </div>
                    <div className="BannerGraphic">🍇</div>
                  </div>

                  <div className="LatestStepsSection">
                    <div className="SectionHeaderRow">
                      <h3>Your latest steps</h3>
                      <span className="ViewAllLink" onClick={() => handleOpenScenario(null)}>
                        Practice scenarios ↗
                      </span>
                    </div>

                    <div className="StepsList">
                      <div className="StepItem">
                        <div className="StepCheckIcon">✓</div>
                        <div className="StepInfo">
                          <strong>Level 0 check</strong>
                          <span>Nov 2 • Level check</span>
                        </div>
                        <div className="StepScoreBadge">{profile?.score ?? 78}/100<br /><small>Passed</small></div>
                      </div>

                      <div className="StepItem">
                        <div className="StepCheckIcon">✓</div>
                        <div className="StepInfo">
                          <strong>Ordering at a café</strong>
                          <span>Nov 2 • Practice</span>
                        </div>
                        <div className="StepScoreBadge">74/100<br /><small>Completed</small></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="RightColumnPath">
                  <div className="PathHeaderRow">
                    <h3>Your learning path</h3>
                    <span className="PathIcon">⇄</span>
                  </div>
                  <p className="PathSubHeader">Every level is a new set of real-life possibilities.</p>

                  <div className="PathStepsList">
                    <div className="PathStepCard passed">
                      <div className="PathNumCircle">0</div>
                      <div className="PathStepDetails">
                        <div className="PathTitleRow">
                          <strong>Find your footing</strong>
                          <span className="CheckMark">✓</span>
                        </div>
                        <p>Introductions & everyday asks</p>
                        <span className="PathStatus passed">Passed - {profile?.score ?? 78}/100</span>
                      </div>
                    </div>

                    <div className="PathStepCard active">
                      <div className="PathNumCircle">1</div>
                      <div className="PathStepDetails">
                        <div className="PathTitleRow">
                          <strong>Build a clear response</strong>
                          <span className="PlayIcon">▷</span>
                        </div>
                        <p>Structure, examples & response flow</p>
                        <span className="PathStatus active">Unlocked - Active</span>
                      </div>
                    </div>

                    <div className="PathStepCard locked">
                      <div className="PathNumCircle">2</div>
                      <div className="PathStepDetails">
                        <div className="PathTitleRow">
                          <strong>Navigate tricky moments</strong>
                          <span className="LockIcon">🔒</span>
                        </div>
                        <p>Workplace & learning conversations</p>
                        <span className="PathStatus locked">Locked - Pass Level 1 with 70+</span>
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