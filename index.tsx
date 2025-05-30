
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure API_KEY is set in the environment for Gemini service
// In AI Studio, this is managed via the "Secrets" panel.
// The .env.local file is for local development if you download the code.

// Check for API_KEY, as this is what geminiService.ts expects.
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable is not set in AI Studio Secrets. Gemini API calls will fail or use mock data.");
  // The app includes a visual warning if keys are missing or placeholders.
  // For actual functionality, this key must be valid and set in AI Studio Secrets.
}

if (!process.env.YOUTUBE_API_KEY) {
    console.warn("YOUTUBE_API_KEY environment variable is not set in AI Studio Secrets. YouTube API calls will fail or use mock data.");
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