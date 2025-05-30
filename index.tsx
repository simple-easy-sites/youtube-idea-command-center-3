import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Import Tailwind CSS

// For Vite, environment variables accessed via import.meta.env must be prefixed with VITE_.
// These will be replaced by actual values during the build process by Vite.
// Ensure VITE_YOUTUBE_API_KEY is set in your Vercel dashboard.
// For Gemini API, the SDK requires process.env.API_KEY. Assume this is configured
// in the Vercel environment and made available to the client-side build (e.g., via Vite's define feature).

// --- BEGIN DEBUG LOGGING ---
// This logs the VITE_API_KEY from import.meta.env, which might be different from process.env.API_KEY used by Gemini.
console.log('[DEBUG] Attempting to read VITE_API_KEY from import.meta.env:', import.meta.env.VITE_API_KEY);
console.log('[DEBUG] Attempting to read VITE_YOUTUBE_API_KEY from import.meta.env:', import.meta.env.VITE_YOUTUBE_API_KEY);
console.log('[DEBUG] Checking process.env.API_KEY for Gemini:', process.env.API_KEY ? 'Exists' : 'Not Found/Empty');
// --- END DEBUG LOGGING ---

// Check for API_KEY for Gemini (using process.env.API_KEY as per SDK guidelines)
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable for Gemini (expected at process.env.API_KEY) is not set. Gemini API calls will fail or use mock data. On Vercel, ensure API_KEY (without VITE_ prefix) is set in Project Settings > Environment Variables and made available to the frontend build. If you are using VITE_API_KEY, the service has been updated to prefer process.env.API_KEY.");
} else if (process.env.API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || process.env.API_KEY === "MISSING_API_KEY_WILL_FAIL") {
  console.warn("API_KEY for Gemini (process.env.API_KEY) is set to a placeholder value. Gemini API calls will use mock data or fail. Please use your actual Gemini API Key.");
}

// Check for VITE_YOUTUBE_API_KEY (using import.meta.env as it's not Gemini SDK)
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
