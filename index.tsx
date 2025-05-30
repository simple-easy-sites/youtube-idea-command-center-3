
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure API_KEY is set in the environment for Gemini service
// In AI Studio, this is managed via the "Secrets" panel.
// The .env.local file is for local development if you download the code.

// --- BEGIN DEBUG LOGGING ---
console.log('[DEBUG] Attempting to read API_KEY from process.env:', process.env.API_KEY);
console.log('[DEBUG] Attempting to read YOUTUBE_API_KEY from process.env:', process.env.YOUTUBE_API_KEY);
// --- END DEBUG LOGGING ---

// Check for API_KEY, as this is what geminiService.ts expects.
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable is not set. Gemini API calls will fail or use mock data. On Vercel, ensure this is set in Project Settings > Environment Variables and the project is redeployed.");
} else if (process.env.API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || process.env.API_KEY === "MISSING_API_KEY_WILL_FAIL") {
  console.warn("API_KEY is set to a placeholder value. Gemini API calls will use mock data or fail. Please use your actual Gemini API Key.");
}


if (!process.env.YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY environment variable is not set. YouTube API calls will fail or use mock data. On Vercel, ensure this is set in Project Settings > Environment Variables and the project is redeployed.");
} else if (process.env.YOUTUBE_API_KEY === "YOUR_ACTUAL_YOUTUBE_API_KEY_HERE" || process.env.YOUTUBE_API_KEY === "MISSING_YOUTUBE_API_KEY") {
    console.warn("YOUTUBE_API_KEY is set to a placeholder value. YouTube API calls will use mock data or fail. Please use your actual YouTube API Key.");
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);