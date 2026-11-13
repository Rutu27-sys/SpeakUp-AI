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
  currentLevel: { type: String, default: 'Level 0' },
  score: { type: Number, default: 0 }
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

app.post('/api/evaluate-assessment', async (req, res) => {
  try {
    const { userId, transcripts } = req.body;

    const prompt = `
      You are Toki, a warm, encouraging AI communication coach for "SpeakUp AI". 
      A user has completed their initial 3-question speaking assessment. Here are their spoken transcripts:
      - Question 1 (Introduction): "${transcripts[1] || 'No response'}"
      - Question 2 (Directions): "${transcripts[2] || 'No response'}"
      - Question 3 (Support): "${transcripts[3] || 'No response'}"

      Evaluate their speech clarity, confidence, and structure. 
      Provide your response strictly in the following JSON format without any extra markdown formatting or backticks:
      {
        "score": 75,
        "assignedLevel": "Level 1",
        "feedback": "A short, warm, encouraging paragraph from Toki summarizing their voice strengths and what to focus on next."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rawText = response.text;
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const evaluation = JSON.parse(cleanedText);

    const updatedUser = await User.findByIdAndUpdate(userId, {
      hasCompletedAssessment: true,
      currentLevel: evaluation.assignedLevel || 'Level 1',
      score: evaluation.score || 70
    }, { new: true });

    res.status(200).json({
      message: 'Assessment evaluated successfully',
      evaluation,
      user: updatedUser
    });

  } catch (err) {
    console.error('AI Evaluation Error:', err);
    res.status(500).json({ error: 'Failed to evaluate assessment using AI. Please try again.' });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Level-Based Scenario & Roleplay Engine
// Shared Multi-Model Helper: Rotates across models with separate Free Tier quotas
// Reliable Multi-Model Fallback using correct model identifiers
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
  if (process.env.GROQ_API_KEY) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });
      const groqData = await groqRes.json();
      return JSON.parse(groqData.choices[0].message.content);
    } catch (groqErr) {
      console.warn('[Groq Fallback] failed:', groqErr.message);
    }
  }
  throw new Error('All Gemini models exhausted.');
}

// Local Scenario Pool (used only if all Gemini quotas are exhausted)
const LOCAL_SCENARIO_BANK = {
  'Level 1': [
    {
      title: 'Wrong Order at a Busy Café',
      category: 'Level 1 Roleplay',
      description: 'You ordered an iced oat latte, but the barista handed you a hot black coffee. Politely explain the mistake and ask for the right drink.',
      starter: 'Here is your hot black coffee! Have a great morning.'
    },
    {
      title: 'Helping a Lost Tourist',
      category: 'Level 1 Roleplay',
      description: 'A visitor stops you near the metro station asking how to reach the main city library. Give clear, step-by-step directions.',
      starter: 'Excuse me! I am a bit lost—could you tell me how to get to the central library from here?'
    }
  ],
  'Level 2': [
    {
      title: 'Explaining a Missed Monday Exam',
      category: 'Level 2 Roleplay',
      description: 'You missed Monday’s important exam due to a sudden medical/family emergency. Speak to your professor and request a makeup test.',
      starter: 'Come in. I noticed your seat was empty during Monday’s exam. What happened?'
    },
    {
      title: 'Resolving a Group Project Delay',
      category: 'Level 2 Roleplay',
      description: 'Your teammate missed their deadline right before the presentation. Address the issue calmly and agree on a recovery plan.',
      starter: 'Hey, I know the slides were due an hour ago—I got stuck on my section. Where do we stand?'
    }
  ],
  'Level 3': [
    {
      title: 'Strict HR Interview: Late Arrival',
      category: 'Level 3 Roleplay',
      description: 'You are in a job interview and the HR manager is very strict about punctuality, but you arrived 10 minutes late. Apologize professionally and recover.',
      starter: 'Why are you late? We scheduled this interview for sharp 10:00 AM, and punctuality matters here.'
    },
    {
      title: 'Defending Your Technical Architecture',
      category: 'Level 3 Roleplay',
      description: 'A senior engineering interviewer questions why you chose your current tech stack for your portfolio project. Explain your reasoning clearly.',
      starter: 'Walk me through your recent project—why did you choose that specific stack over simpler alternatives?'
    }
  ]
};

// 1. Level-Based Scenario Generator
app.post('/api/generate-scenario', async (req, res) => {
  const { level } = req.body;
  const targetLevel = level || 'Level 1';

  let difficultyGuide = '';
  if (targetLevel === 'Level 1') {
    difficultyGuide = 'Everyday casual situations (e.g., receiving the wrong coffee order, or helping a stranger with directions).';
  } else if (targetLevel === 'Level 2') {
    difficultyGuide = 'Academic or intermediate situations (e.g., explaining to a strict professor why you missed Monday’s exam and requesting a retest).';
  } else {
    difficultyGuide = 'High-stakes job interviews (e.g., a strict HR manager questioning why you arrived late, or asking you to introduce yourself and justify why you fit the role).';
  }

  const prompt = `
    You are Toki, an AI communication coach creating an unscripted roleplay exercise.
    Target Level: ${targetLevel}
    Guideline: ${difficultyGuide}

    Generate a fresh, realistic scenario. Return strictly JSON without markdown:
    {
      "title": "Short title",
      "category": "${targetLevel} Roleplay",
      "description": "Clear 1-2 sentence situation context for the user",
      "starter": "Toki's very first in-character opening question or statement"
    }
  `;

  try {
    const scenario = await callGeminiWithFallback(prompt);
    res.status(200).json(scenario);
  } catch (err) {
    const pool = LOCAL_SCENARIO_BANK[targetLevel] || LOCAL_SCENARIO_BANK['Level 1'];
    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    res.status(200).json(randomPick);
  }
});

// 2. Natural 2-Way In-Character Roleplay Chat
app.post('/api/chat', async (req, res) => {
  const { scenarioDescription, message, history } = req.body;

  const conversationHistory = (history || [])
    .map((m) => `${m.sender === 'user' ? 'User' : 'Toki'}: ${m.text}`)
    .join('\n');

  const prompt = `
    You are playing a realistic human character in an English speaking roleplay.
    Scenario Context: "${scenarioDescription}"

    Conversation so far:
    ${conversationHistory}
    User: "${message}"

    Rules:
    - Stay 100% in character (e.g., strict HR manager, professor, barista, or interviewer).
    - React directly to the user's actual words—challenge vague excuses or ask a natural follow-up question like a real person would.
    - Keep your response natural and concise (1-3 sentences).

    Return strictly JSON without markdown:
    {
      "reply": "Your in-character response",
      "tip": "Optional 1-line speaking tip (or null)"
    }
  `;

  try {
    const parsed = await callGeminiWithFallback(prompt);
    res.status(200).json(parsed);
  } catch (err) {
    // Context-aware local fallback if all API quotas are exhausted
    const userWords = message.trim().split(/\s+/).length;
    const reply =
      userWords < 6
        ? "That's quite brief—can you explain that in a bit more detail? I want to hear your full reasoning."
        : "I hear what you're saying, though how would you ensure this doesn't become a recurring issue going forward?";
    res.status(200).json({
      reply,
      tip: 'Aim for 2–3 complete sentences with clear reasoning.'
    });
  }
});

// 3. Strict End-of-Session Evaluation & Scorecard
app.post('/api/end-session-feedback', async (req, res) => {
  try {
    const { userId, scenarioTitle, scenarioDescription, history } = req.body;
    const userTurns = (history || []).filter((m) => m.sender === 'user');
    const allUserText = userTurns.map((t) => t.text).join(' ').trim();
    const totalWords = allUserText ? allUserText.split(/\s+/).length : 0;

    const transcriptLog = (history || [])
      .map((m) => `${m.sender === 'user' ? 'User' : 'Toki'}: ${m.text}`)
      .join('\n');

    const prompt = `
      You are a strict English communication evaluator for "SpeakUp AI".
      Scenario: "${scenarioTitle}" (${scenarioDescription})
      Transcript:
      ${transcriptLog}

      Strict Grading Rubric (Pass mark = 70):
      - If the user gave short, incomplete, or low-effort answers (fewer than 20 total words or only 1–2 turns), score MUST be between 35 and 62 (failed).
      - Check grammar, politeness, clarity, and whether they properly solved the scenario.
      - Explain the exact reason for the score and what to fix.

      Return strictly JSON without markdown:
      {
        "score": <number 35-95>,
        "passed": <boolean true if score >= 70 else false>,
        "speechClarity": "<Specific critique of sentence structure, grammar, and clarity>",
        "strength": "<What worked well, or note lack of detail>",
        "improvement": "<Exact reason marks were deducted and what to improve>",
        "summary": "<Direct, honest closing verdict>"
      }
    `;

    let feedbackData;
    try {
      feedbackData = await callGeminiWithFallback(prompt);
    } catch (err) {
      // Strict heuristic fallback so short/lazy test inputs NEVER get an inflated 93
      const avgWordsPerTurn = userTurns.length > 0 ? totalWords / userTurns.length : 0;
      let score = 40;
      if (userTurns.length >= 3) score += 18;
      else if (userTurns.length === 2) score += 10;

      if (avgWordsPerTurn >= 12) score += 22;
      else if (avgWordsPerTurn >= 7) score += 12;
      else score += 3;

      if (/\b(please|sorry|apologize|thank|because|ensure|experience|project)\b/i.test(allUserText)) {
        score += 8;
      }
      score = Math.max(35, Math.min(92, score));
      const passed = score >= 70;

      feedbackData = {
        score,
        passed,
        speechClarity:
          avgWordsPerTurn < 8
            ? `Your responses averaged only ${Math.round(avgWordsPerTurn)} words per turn, which felt too abrupt for this scenario.`
            : `Clear sentence flow across ${userTurns.length} turns (${totalWords} total words).`,
        strength:
          userTurns.length >= 2
            ? 'You stayed engaged with the prompts and responded directly.'
            : 'You initiated the roleplay response.',
        improvement: passed
          ? 'Add a concrete example or proactive next step to push your score above 85.'
          : 'Marks were deducted because your answers were too short and lacked a complete explanation or polite framing.',
        summary: passed
          ? 'Congrats! You passed this scenario and demonstrated solid conversational control.'
          : 'Not quite there yet—expand your answers into 2–3 full sentences and try again.'
      };
    }

    let updatedUser = null;
    if (userId) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          score: feedbackData.score,
          currentLevel: feedbackData.passed ? 'Level 2' : 'Level 1'
        },
        { returnDocument: 'after' }
      );
    }

    res.status(200).json({ ...feedbackData, user: updatedUser });
  } catch (err) {
    console.error('Feedback Error:', err);
    res.status(500).json({ error: 'Could not generate feedback.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));