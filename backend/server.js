const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(cors());
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasCompletedAssessment: { type: Boolean, default: false },
  currentLevel: { type: Number, default: 0 },
  levelPasses: { type: Number, default: 0 },  
  score: { type: Number, default: 0 },
  completedScenarios: [
    {
      title: String,
      level: Number,
      score: Number,
      passed: Boolean,
      speechClarity: String,
      politenessAndTone: String,
      improvement: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

const User = mongoose.model('User', userSchema);

 app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ message: 'User created successfully', token, username: newUser.username ,hasCompletedAssessment: newUser.hasCompletedAssessment, currentLevel: newUser.currentLevel});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ 
      message: 'Logged in successfully', 
      token, 
      userId: user._id, 
      username: user.username,
      hasCompletedAssessment: user.hasCompletedAssessment,
      currentLevel: user.currentLevel
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/complete-assessment', async (req, res) => {
  try {
    const { userId, calculatedScore } = req.body;
    let assignedLevel = 'Level 0';
    if (calculatedScore >= 70) assignedLevel = 'Level 2';
    else if (calculatedScore >= 50) assignedLevel = 'Level 1';
    const updatedUser = await User.findByIdAndUpdate(userId, {
      hasCompletedAssessment: true,
      currentLevel: assignedLevel
    }, { new: true });
    res.json({ message: "Assessment completed successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function callGeminiWithFallback(prompt) {
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.8-flash'
  ];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn(`[AI Fallback] ${model} failed (${err.status || err.message}), trying next...`);
    }
  }
  throw new Error('All Gemini models are busy.');
}

function getCurriculumGuide(levelNum) {
  if (levelNum === 0) {
    return 'Level 0 (Everday Conversations): Simple, polite everyday interactions—e.g., ordering coffee and politely pointing out a wrong order, asking a store clerk for an item size, or giving clear street directions.';
  }
  if (levelNum === 1) {
    return 'Level 1 (Campus & Social Confidence): Explaining a situation clearly—e.g., telling a professor why you missed Monday’s exam and requesting a makeup, introducing yourself to a new study group, or rescheduling a group meeting.';
  }
  if (levelNum === 2) {
    return 'Level 2 (Entry-Level Job Interviews): Standard HR & behavioral interviews—e.g., answering "Tell me about yourself and your strengths", explaining a project challenge you overcame, or answering why you applied for this role.';
  }
  if (levelNum === 3) {
    return 'Level 3 (High-Stakes Workplace & Pressure): Unexpected curveballs—e.g., apologizing to a strict HR manager for arriving late to an interview, handling a dissatisfied client, or pitching an idea to a skeptical team lead.';
  }
  return `Level ${levelNum} (Executive & Advanced Persuasion): Complex, unscripted leadership scenarios—e.g., negotiating a job offer, resolving a cross-team conflict, or answering high-pressure executive questions with poise.`;
}
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.post('/api/generate-scenario', async (req, res) => {
  try {
    const { userId, requestedLevel } = req.body;
    const user = userId ? await User.findById(userId) : null;
    const levelNum = requestedLevel !== undefined ? Number(requestedLevel) : (user?.currentLevel ?? 0);
    const pastTitles = (user?.completedScenarios || []).map((s) => s.title).join(', ');
    const prompt = `
      You are Toki, an AI English communication coach designing a progressive speaking course.
      Target Level: Level ${levelNum}
      Curriculum Focus: ${getCurriculumGuide(levelNum)}
      Already completed scenarios (DO NOT repeat these): [${pastTitles || 'None'}]

      Create ONE brand-new, realistic, unscripted roleplay scenario at this exact difficulty level.
      Return strictly JSON without markdown backticks:
      {
        "level": ${levelNum},
        "title": "Short engaging title",
        "category": "Level ${levelNum} • Communication Practice",
        "description": "Clear 1-2 sentence context explaining who the user is talking to and what their goal is.",
        "persona": "Who Toki is playing (e.g., 'Barista', 'Strict HR Manager', 'University Professor')",
        "starter": "Toki's realistic opening line in character to begin the conversation."
      } `;
    const scenario = await callGeminiWithFallback(prompt);
    res.status(200).json(scenario);
  } catch (err) {
    console.error('Scenario Gen Error:', err);
    res.status(200).json({
      level: 0,
      title: 'Wrong Order at a Busy Café',
      category: 'Level 0 • Communication Practice',
      description: 'You ordered an iced caramel latte, but the barista gave you a hot black coffee. Politely explain the mix-up and ask for the right drink.',
      persona: 'Busy Barista',
      starter: 'Here is your hot black coffee! Next in line, please!'
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { scenarioDescription, persona, message, history } = req.body;
    const conversationHistory = (history || [])
      .map((m) => `${m.sender === 'user' ? 'User' : persona || 'Toki'}: ${m.text}`)
      .join('\n');
    const prompt = `
      You are roleplaying as "${persona || 'Conversation Partner'}" in a realistic English communication exercise.
      Scenario Context: "${scenarioDescription}"
      Conversation so far:
      ${conversationHistory}
      User: "${message}"
      Instructions:
      - Respond naturally like a real human in this situation (just like ChatGPT in roleplay mode).
      - React directly to what the user actually said—if they give a weak excuse, push back realistically; if they are polite and clear, respond accordingly and ask a natural follow-up question to keep the 3-minute conversation flowing.
      - Keep your response conversational (1–3 sentences).
      Return strictly JSON without markdown backticks:
      {
        "reply": "Your natural in-character response",
        "tip": "Optional 1-sentence coaching hint on grammar/politeness (or null)"
      }`;
    const parsed = await callGeminiWithFallback(prompt);
    res.status(200).json(parsed);
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ error: 'Toki had a quick connection hiccup—please send that again!' });
  }
});

app.post('/api/end-session-feedback', async (req, res) => {
  try {
    const { userId, level, scenarioTitle, scenarioDescription, history } = req.body;
    const userTurns = (history || []).filter((m) => m.sender === 'user');
    const allUserText = userTurns.map((t) => t.text).join(' ').trim();
    const totalWords = allUserText ? allUserText.split(/\s+/).length : 0;
    const transcriptLog = (history || [])
      .map((m) => `${m.sender === 'user' ? 'User' : 'Character'}: ${m.text}`)
      .join('\n');
    const prompt = `
      You are a strict English communication examiner for "SpeakUp AI".
      Level: Level ${level}
      Scenario: "${scenarioTitle}" — ${scenarioDescription}
      Full Conversation Transcript:
      ${transcriptLog}
      STRICT GRADING RUBRIC (Pass mark = 70/100):
      1. Speech Clarity & Sentence Structure (35 pts)
      2. Grammar & Vocabulary (35 pts)
      3. Politeness, Tone & Scenario Resolution (30 pts)
      - If responses are under 20 words or fewer than 2 turns, score must be below 62 (failed).
      Return strictly JSON without markdown backticks:
      {
        "score": <integer 30-96>,
        "passed": <boolean true if score >= 70 else false>,
        "speechClarity": "<Detailed paragraph analyzing their sentence structure, grammar, and articulation>",
        "politenessAndTone": "<Detailed paragraph analyzing their politeness, tone, and character engagement>",
        "improvement": "<Specific, actionable advice with examples of better phrasing>",
        "summary": "<Direct verdict from Toki>"
      } `;
    let evaluation;
    try {
      evaluation = await callGeminiWithFallback(prompt);
    } catch (err) {
      const avgWords = userTurns.length > 0 ? totalWords / userTurns.length : 0;
      let score = 42;
      if (userTurns.length >= 3) score += 18;
      if (avgWords >= 10) score += 20;
      score = Math.max(35, Math.min(92, score));
      const passed = score >= 70;
      evaluation = {
        score,
        passed,
        speechClarity: `Your responses averaged ${Math.round(avgWords)} words per turn across ${userTurns.length} turns. Expand your thoughts into multi-clause sentences to improve structural flow.`,
        politenessAndTone: passed ? 'Maintained a cooperative and respectful tone with the character.' : 'Tone felt abrupt or lacked polite opening phrasing.',
        improvement: 'Incorporate transition phrases (e.g., "I understand your concern, however...", "Could we consider...") to elevate your conversational English.',
        summary: passed ? 'Solid practice session — you met the criteria.' : 'Needs more detail and complete sentence structuring to pass.'
      };
    }
    let updatedUser = null;
    let levelUnlocked = false;
    const REQUIRED_PASSES = 3;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const currentLvl = user.currentLevel ?? 0;
        let passes = user.levelPasses ?? 0;
        if (evaluation.passed && Number(level) === currentLvl) {
          passes += 1;
        }
        let nextLevel = currentLvl;
        if (passes >= REQUIRED_PASSES) {
          nextLevel = currentLvl + 1;
          passes = 0;
          levelUnlocked = true;
        }
        updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            score: evaluation.score,
            currentLevel: nextLevel,
            levelPasses: passes,
            $push: {
              completedScenarios: {
                title: scenarioTitle,
                level: Number(level),
                score: evaluation.score,
                passed: evaluation.passed,
                speechClarity: evaluation.speechClarity,
                politenessAndTone: evaluation.politenessAndTone,
                improvement: evaluation.improvement
              }
            }
          },
          { returnDocument: 'after' }
        );
      }
    }
    res.status(200).json({
      ...evaluation,
      levelUnlocked,
      requiredPasses: REQUIRED_PASSES,
      user: updatedUser
    });
  } catch (err) {
    console.error('Feedback Error:', err);
    res.status(500).json({ error: 'Could not evaluate session.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));