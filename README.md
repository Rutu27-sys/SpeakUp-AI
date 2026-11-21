# SpeakUp AI 
A level-progressive AI English speaking coach powered by Google Gemini.

# Problem & Solution
Practicing spoken English alone is intimidating, and generic AI chatbots (like a blank ChatGPT window) lack structure, level progression, or objective feedback. **SpeakUp AI** solves this by assessing a learner's baseline level, placing them into structured real-world roleplay scenarios with an AI Toki, and scoring every reply on speech clarity, tone, and actionable improvements.

# Key Features
- **Adaptive Level Assessment:** Evaluates starting proficiency so learners begin at the right difficulty tier.
- **Interactive Roleplay Studio:** Real-time conversational scenarios with Toki, complete with live audio , feedback and transcripts.
- **Structured Feedback:** Breaks down every response across **Speech Clarity**, **Politeness & Tone**, and **Specific Improvements** with pass/retry thresholds.
- **Growth :** Tracks completed sessions and historical feedback modals so learners can monitor progress over time.

# AI Implementation
- **Model:** Google Gemini API ('gemini-3.5-flash-lite',
                                'gemini-3.1-flash-lite',
                                'gemini-3.6-flash',
                                'gemini-3.8-flash')
- **How it works:** Structured system prompts instruct Gemini to stay in character as a supportive scenario partner while simultaneously returning structured JSON evaluations (numeric scores + targeted improvement tips) for each user turn.

# Tech Stack
- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI:** Google Gemini API

# Local Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rutu27-sys/SpeakUp-AI.git
   cd speakup-ai

2. **Backend Setup:**
   cd backend
   npm install
   Create a .env file in backend/ with:
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     GEMINI_API_KEY=your_google_gemini_api_key
   Start the server: npm start (or node server.js).
3. **Frontend Setup**
   cd ../frontend
   npm install
   npm run dev
   Open http://localhost:5173 in your browser.

# My Contribution & What I Learned
Built the SpeakUp AI web app from scratch using React, Vite, Node.js, Express, and MongoDB.
Created the user screens and navigation for landing, login, signup, the level assessment, live roleplay with Toki, and the Growth tracking page.
Connected the backend with the Google Gemini API (@google/genai) to generate roleplay scenarios, chat responses, and session feedback, plus added model fallbacks so the app stays reliable.
Set up user accounts, and MongoDB storage to save progress, level passes, and past session feedback.
Learned how to connect a frontend and backend smoothly, handle authentication and origin issues, and write prompts that give structured, useful feedback.

**Tools I Used**
**In the app:** Google Gemini API (@google/genai) for AI roleplay and feedback
**While building:** VS Code, Git & GitHub, MongoDB, and AI coding assistants like Gemini and ChatGPT to help debug errors, test logic, and refine prompts.
