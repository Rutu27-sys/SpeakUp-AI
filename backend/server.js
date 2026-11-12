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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));