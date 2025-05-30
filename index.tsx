
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import Tailwind CSS

// For Vite, environment variables must be prefixed with VITE_
// These will be replaced by actual values during the build process by Vite.
// Ensure these (VITE_API_KEY, VITE_YOUTUBE_API_KEY) are set in your Vercel dashboard.

// --- BEGIN DEBUG LOGGING ---
console.log('[DEBUG] Attempting to read VITE_API_KEY from import.meta.env:', import.meta.env.VITE_API_KEY);
console.log('[DEBUG] Attempting to read VITE_YOUTUBE_API_KEY from import.meta.env:', import.meta.env.VITE_YOUTUBE_API_KEY);
// --- END DEBUG LOGGING ---

// Check for VITE_API_KEY for Gemini
if (!import.meta.env.VITE_API_KEY) {
  console.warn("VITE_API_KEY environment variable is not set. Gemini API calls will fail or use mock data. On Vercel, ensure VITE_API_KEY is set in Project Settings > Environment Variables and the project is redeployed. NOTE THE 'VITE_' PREFIX!");
} else if (import.meta.env.VITE_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || import.meta.env.VITE_API_KEY === "MISSING_API_KEY_WILL_FAIL") {
  console.warn("VITE_API_KEY is set to a placeholder value. Gemini API calls will use mock data or fail. Please use your actual Gemini API Key in Vercel, prefixed with VITE_.");
}

// Check for VITE_YOUTUBE_API_KEY
if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
    console.warn("VITE_YOUTUBE_API_KEY environment variable is not set. YouTube API calls will fail or use mock data. On Vercel, ensure VITE_YOUTUBE_API_KEY is set in Project Settings > Environment Variables and the project is redeployed. NOTE THE 'VITE_' PREFIX!");
} else if (import.meta.env.VITE_YOUTUBE_API_KEY === "YOUR_ACTUAL_YOUTUBE_API_KEY_HERE" || import.meta.env.VITE_YOUTUBE_API_KEY === "MISSING_YOUTUBE_API_KEY") {
    console.warn("VITE_YOUTUBE_API_KEY is set to a placeholder value. YouTube API calls will use mock data or fail. Please use your actual YouTube API Key in Vercel, prefixed with VITE_.");
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
