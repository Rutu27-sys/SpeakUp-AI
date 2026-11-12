import React, { useState, useEffect } from 'react';
import ChatStudio from './ChatStudio';
import './Dashboard.css';

const SCENARIOS = [
  {
    id: 'coffee',
    tag: 'EVERYDAY CONFIDENCE',
    title: 'Ordering at a busy café',
    desc: 'Practice speaking clearly and making a custom request without rushing.',
    starter: "Hi there! Welcome in. What can I get started for you today?"
  },
  {
    id: 'intro',
    tag: 'SOCIAL & CLASSROOM',
    title: 'Joining a new study group',
    desc: 'Introduce yourself and share what you are working on naturally.',
    starter: "Hey! Glad you could join us. Tell us a bit about yourself!"
  },
  {
    id: 'support',
    tag: 'SELF-ADVOCACY',
    title: 'Asking a mentor for guidance',
    desc: 'Explain a roadblock clearly and ask a direct question.',
    starter: "Hey, I have a few minutes before my next meeting. What's on your mind?"
  }
];

const Dashboard = ({ user, onLogout }) => {
  const [profile, setProfile] = useState(user || null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [activeNav, setActiveNav] = useState('learning');

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

  if (activeScenario) {
    return (
      <ChatStudio 
        user={profile} 
        scenario={activeScenario} 
        onBack={() => setActiveScenario(null)} 
      />
    );
  }

  const initials = profile?.username ? profile?.username.substring(0, 2).toUpperCase() : 'SU';

  return (
    <div className="AppLayout">
      {/* LEFT SIDEBAR */}
      <aside className="AppSidebar">
        <div className="SidebarLogoArea">
          <span className="SidebarLogoText">SpeakUp AI</span>
        </div>

        <div className="SidebarNavGroup">
          <div className="SidebarGroupTitle">YOUR LEARNING STUDIO</div>
          <button 
            className={`SidebarNavItem ${activeNav === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveNav('learning')}
          >
            📚 My learning
          </button>
          <button 
            className={`SidebarNavItem ${activeNav === 'scenarios' ? 'active' : ''}`}
            onClick={() => setActiveNav('scenarios')}
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
            <strong>A little practice.<br/>A louder you.</strong>
            <p>Your next small step is a big deal. I'm here for it.</p>
            <span className="TokiSig">— Toki, your speaking coach</span>
          </div>
        </div>

        <div className="SidebarFooterGroup">
          <button className="SidebarFooterItem">❓ Help & feedback</button>
          <button className="SidebarFooterItem">⚙️ Settings</button>
          
          <div className="SidebarUserProfile" onClick={onLogout} title="Click to log out">
            <div className="UserAvatarBubble">{initials}</div>
            <div className="UserInfoText">
              <span className="UserName">{profile?.username || 'Speaker'}</span>
              <span className="UserSubText">Click to log out</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="AppMainContent">
        <header className="MainTopBar">
          <div className="Breadcrumb">My learning / Your studio</div>
          <div className="TopBarRight">
            <div className="StreakPill">🔥 2-day practice streak</div>
            <button className="BellBtn">🔔</button>
            <div className="StatusGreenDot"></div>
          </div>
        </header>

        <section className="DashboardHeroArea">
          <div className="HeroDateText">TUESDAY, NOVEMBER 3</div>
          <h1 className="HeroGreeting">Good to hear you, {profile?.username || 'Speaker'}.</h1>
          <p className="HeroSubText">You’ve built a foundation. Now let’s make your next response a little clearer.</p>

          {/* Metric Cards Row */}
          <div className="MetricsRow">
            <div className="MetricCard">
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
                  <p>Practice a job interview introduction. Lead with your main point, then bring it to life.</p>
                  <div className="BannerMeta">
                    <span>6 min</span> • <span>Role simulation</span>
                  </div>
                  <button className="StartBannerBtn" onClick={() => setActiveScenario(SCENARIOS[0])} >
                    Start "Ordering at a café" →
                  </button>
                </div>
                <div className="BannerGraphic">🍇</div>
              </div>

              {/* Latest Steps Section */}
              <div className="LatestStepsSection">
                <div className="SectionHeaderRow">
                  <h3>Your latest steps</h3>
                  <span className="ViewAllLink">View growth ↗</span>
                </div>

                <div className="StepsList">
                  <div className="StepItem">
                    <div className="StepCheckIcon">✓</div>
                    <div className="StepInfo">
                      <strong>Level 0 check</strong>
                      <span>Nov 2 • Level check</span>
                    </div>
                    <div className="StepScoreBadge">78/100<br/><small>Passed</small></div>
                  </div>

                  <div className="StepItem">
                    <div className="StepCheckIcon">✓</div>
                    <div className="StepInfo">
                      <strong>Ask your teacher for help</strong>
                      <span>Nov 2 • Practice</span>
                    </div>
                    <div className="StepScoreBadge">74/100<br/><small>Completed</small></div>
                  </div>

                  <div className="StepItem">
                    <div className="StepCheckIcon">✓</div>
                    <div className="StepInfo">
                      <strong>Ask a stranger for directions</strong>
                      <span>Nov 1 • Practice</span>
                    </div>
                    <div className="StepScoreBadge">68/100<br/><small>Completed</small></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Learning Path Timeline */}
            <div className="RightColumnPath">
              <div className="PathHeaderRow">
                <h3>Your learning path</h3>
                <span className="PathIcon">⚙️</span>
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
                    <span className="PathStatus passed">Passed - 78/100</span>
                  </div>
                </div>

                <div className="PathStepCard active">
                  <div className="PathNumCircle">1</div>
                  <div className="PathStepDetails">
                    <div className="PathTitleRow">
                      <strong>Build a clear response</strong>
                      <span className="PlayIcon">▶</span>
                    </div>
                    <p>Structure, examples & response flow</p>
                    <span className="PathStatus active">Unlocked - 0/4 steps</span>
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

                <div className="PathStepCard locked">
                  <div className="PathNumCircle">3</div>
                  <div className="PathStepDetails">
                    <div className="PathTitleRow">
                      <strong>Speak with impact</strong>
                      <span className="LockIcon">🔒</span>
                    </div>
                    <p>Persuasion & thoughtful feedback</p>
                    <span className="PathStatus locked">Locked - Pass Level 2 with 70+</span>
                  </div>
                </div>
              </div>

              <p className="PathFooterNote">Only level checks unlock the next level. A practice score helps you learn, not skip ahead.</p>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;