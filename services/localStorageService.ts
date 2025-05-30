
import { VideoIdea } from '../types';

const BASE_STORAGE_KEY = 'youtubeIdeaCommandCenter_ideas';
const PROFILES_LIST_KEY = 'youtubeIdeaCommandCenter_profilesList'; // Key for storing the list of all profiles
const LAST_ACTIVE_PROFILE_KEY = 'youtubeIdeaCommandCenter_lastActiveProfile';

// Generates a unique storage key for ideas based on the profileId.
// Basic sanitization is applied to the profileId.
const getIdeasStorageKeyForProfile = (profileId: string): string => {
    if (!profileId || profileId.trim() === "") {
        // This case should ideally be prevented by UI logic, but as a fallback:
        console.warn("Profile ID is empty when getting ideas key, using default storage key segment 'default_user_ideas'");
        return `${BASE_STORAGE_KEY}_default_user_ideas`;
    }
    // Sanitize profileId to be a valid part of a localStorage key
    const sanitizedProfileId = profileId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${BASE_STORAGE_KEY}_${sanitizedProfileId}`;
}

export const getAllIdeas = (profileId: string): VideoIdea[] => {
  if (!profileId) return []; // Do not attempt to load ideas for an empty profileId
  const ideasStorageKey = getIdeasStorageKeyForProfile(profileId);
  try {
    const storedIdeas = localStorage.getItem(ideasStorageKey);
    if (storedIdeas) {
      return JSON.parse(storedIdeas) as VideoIdea[];
    }
  } catch (error) {
    console.error(`Error reading ideas from localStorage for profile ${profileId}:`, error);
    localStorage.removeItem(ideasStorageKey);
  }
  return [];
};

export const saveAllIdeas = (ideas: VideoIdea[], profileId: string): void => {
  if (!profileId) {
    console.warn("Attempted to save ideas with an empty profileId. Operation skipped.");
    return;
  }
  const ideasStorageKey = getIdeasStorageKeyForProfile(profileId);
  try {
    localStorage.setItem(ideasStorageKey, JSON.stringify(ideas));
  } catch (error) {
    console.error(`Error saving ideas to localStorage for profile ${profileId}:`, error);
  }
};

// Functions to manage the list of all profiles
export const getAllProfiles = (): string[] => {
  try {
    const storedProfiles = localStorage.getItem(PROFILES_LIST_KEY);
    if (storedProfiles) {
      const profiles = JSON.parse(storedProfiles) as string[];
      return profiles.filter(p => p && p.trim() !== ""); // Ensure no empty strings in profile list
    }
  } catch (error) {
    console.error('Error reading profiles list from localStorage:', error);
    localStorage.removeItem(PROFILES_LIST_KEY); // Clear corrupted data
  }
  return [];
};

export const saveAllProfiles = (profiles: string[]): void => {
  try {
    // Filter out any empty or whitespace-only profile names before saving
    const validProfiles = profiles.filter(p => p && p.trim() !== "");
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(validProfiles));
  } catch (error) {
    console.error('Error saving profiles list to localStorage:', error);
  }
};

// Functions to manage the last active profile name
export const getLastActiveProfile = (): string => {
    return localStorage.getItem(LAST_ACTIVE_PROFILE_KEY) || ''; 
}

export const saveLastActiveProfile = (profileId: string): void => {
    if (profileId && profileId.trim() !== "") {
        localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, profileId.trim());
    } else {
        // If an empty profileId is passed, we might want to clear it or handle it specifically.
        // For now, we only save non-empty trimmed profile IDs.
        // If profileId is deliberately being cleared, explicitly remove:
        // localStorage.removeItem(LAST_ACTIVE_PROFILE_KEY); 
    }
}
