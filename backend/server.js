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
  currentLevel: { type: String, default: 'Level 0' }
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

    res.status(200).json({ message: 'Logged in successfully', token, username: user.username, hasCompletedAssessment: user.hasCompletedAssessment, currentLevel: user.currentLevel});
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));