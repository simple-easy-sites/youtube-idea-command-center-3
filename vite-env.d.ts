/// <reference types="vite/client" />

interface ImportMetaEnv {
  // For YouTube API Key, accessed via import.meta.env
  readonly VITE_YOUTUBE_API_KEY?: string;

  // VITE_API_KEY is typed here because existing UI checks in index.tsx and App.tsx
  // might still refer to it via import.meta.env for initial warnings, even if
  // the Gemini service itself will use process.env.API_KEY.
  // This ensures no TypeScript errors for any import.meta.env.VITE_API_KEY access.
  readonly VITE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
