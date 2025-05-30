

import React, { useState, useEffect, useCallback } from 'react';
import { IdeaStatus, VideoIdea, CategorizedIdeas, FlashMessage, HIGH_RPM_NICHES, IdeaPriority, AIStrategicGuidance, GroundingChunk, TitleSuggestion, UntappedScore, YouTubeVideoResult, HighRpmNicheInfo } from './types';
import { Header } from './components/Header';
import { IdeaForm } from './components/IdeaForm';
import { IdeaSection } from './components/IdeaSection';
import { FlashMessageDisplay } from './components/FlashMessageDisplay';
import { generateIdeasWithGemini, generateVideoScriptAndInstructions, expandIdeaIntoRelatedIdeas, generateKeywordsWithGemini, generateTitleSuggestionsWithGemini } from './services/geminiService';
import { getAllIdeas, saveAllIdeas, getLastActiveProfile, saveLastActiveProfile, getAllProfiles, saveAllProfiles } from './services/localStorageService';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ScriptViewerModal } from './components/ScriptViewerModal';
import { YouTubeViewerModal } from './components/YouTubeViewerModal';
import { TitleOptimizerModal } from './components/TitleOptimizerModal';
import { searchYouTubeForExistingVideos } from './services/youtubeService';
import { CollapsibleSection } from './components/ui/CollapsibleSection'; // Import CollapsibleSection

const App: React.FC = () => {
  const [allProfiles, setAllProfiles] = useState<string[]>(getAllProfiles());
  const [currentProfile, setCurrentProfile] = useState<string>(() => {
    const lastActive = getLastActiveProfile();
    // Ensure last active profile is valid and exists in the list, otherwise default or pick first.
    if (lastActive && getAllProfiles().includes(lastActive)) {
      return lastActive;
    }
    const profiles = getAllProfiles();
    return profiles.length > 0 ? profiles[0] : ''; // Default to first profile or empty
  });
  
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For initial load and profile switch
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);
  
  const [selectedIdeaForScript, setSelectedIdeaForScript] = useState<VideoIdea | null>(null);
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  
  const [selectedIdeaForYouTube, setSelectedIdeaForYouTube] = useState<VideoIdea | null>(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState<boolean>(false);

  const [selectedIdeaForTitleOptimization, setSelectedIdeaForTitleOptimization] = useState<VideoIdea | null>(null);
  const [showTitleOptimizerModal, setShowTitleOptimizerModal] = useState<boolean>(false);

  const [proactiveRecommendations, setProactiveRecommendations] = useState<AIStrategicGuidance | null>(null);

  const addFlashMessage = useCallback((type: FlashMessage['type'], message: string) => {
    const id = crypto.randomUUID();
    setFlashMessages(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setFlashMessages(prev => prev.filter(fm => fm.id !== id));
    }, 5000);
  }, []);

  // Effect for loading profiles initially
  useEffect(() => {
    const loadedProfiles = getAllProfiles();
    setAllProfiles(loadedProfiles);
    const lastActive = getLastActiveProfile();
    if (lastActive && loadedProfiles.includes(lastActive)) {
      setCurrentProfile(lastActive);
    } else if (loadedProfiles.length > 0) {
      setCurrentProfile(loadedProfiles[0]); // Default to first profile if last active is invalid
    } else {
      setCurrentProfile(''); // No profiles exist
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount


  // Effect for loading ideas when currentProfile changes
  useEffect(() => {
    if (currentProfile) {
      setIsLoading(true);
      const loadedIdeas = getAllIdeas(currentProfile);
      setIdeas(loadedIdeas);
      setIsLoading(false);
      if(loadedIdeas.length === 0 && process.env.API_KEY && process.env.API_KEY !== "MISSING_API_KEY_WILL_FAIL" && process.env.API_KEY !== "YOUR_ACTUAL_GEMINI_API_KEY_HERE") { 
        addFlashMessage('info', `Switched to profile '${currentProfile}'. Generate some ideas or let the AI suggest a strategy.`);
      }
    } else {
      // No profile selected, clear ideas and set loading to false (or handle as "no profile selected" state)
      setIdeas([]);
      setIsLoading(false);
      if (allProfiles.length === 0 && process.env.API_KEY && process.env.API_KEY !== "MISSING_API_KEY_WILL_FAIL" && process.env.API_KEY !== "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
         addFlashMessage('info', `Welcome! Please create a profile name to begin.`);
      } else if (allProfiles.length > 0) {
         addFlashMessage('info', `Please select or create a profile to manage ideas.`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]); 

  // Effect for saving ideas when ideas or currentProfile change (and not loading)
  useEffect(() => {
    if (!isLoading && currentProfile) { 
        saveAllIdeas(ideas, currentProfile);
    }
  }, [ideas, isLoading, currentProfile]);

  const handleActivateProfile = (profileToActivate: string) => {
    const trimmedProfile = profileToActivate.trim();
    if (!trimmedProfile) {
      addFlashMessage('error', 'Profile name cannot be empty.');
      return;
    }

    if (trimmedProfile === currentProfile && ideas.length > 0) {
      addFlashMessage('info', `You are already on the '${currentProfile}' profile.`);
      return;
    }
    
    setCurrentProfile(trimmedProfile); // This will trigger the useEffect to load ideas
    saveLastActiveProfile(trimmedProfile);

    if (!allProfiles.includes(trimmedProfile)) {
      const updatedProfiles = [...allProfiles, trimmedProfile].sort();
      setAllProfiles(updatedProfiles);
      saveAllProfiles(updatedProfiles);
      addFlashMessage('success', `Profile '${trimmedProfile}' created and activated.`);
    } else {
      // Flash message for switching is handled by the ideas loading useEffect
    }
  };


  const handleGenerateIdeas = async (userQuery: string, niche: string, appSoftware: string) => {
    if (!currentProfile) {
      addFlashMessage('error', 'Please select or create a profile before generating ideas.');
      return;
    }
    setIsGenerating(true);
    setProactiveRecommendations(null);
    try {
      // Pass the labels of HIGH_RPM_NICHES for contextual understanding by Gemini
      const contextualNicheLabels = HIGH_RPM_NICHES.map(n => n.label);
      const { ideas: generatedIdeasWithRationale, strategicGuidance } = await generateIdeasWithGemini(userQuery, niche, appSoftware, contextualNicheLabels);
      
      if (strategicGuidance) {
        setProactiveRecommendations(strategicGuidance); // Corrected assignment
      }

      const newIdeas: VideoIdea[] = generatedIdeasWithRationale
        .map(ideaWithRationale => ({
          id: crypto.randomUUID(),
          text: ideaWithRationale.text.trim(),
          aiRationale: ideaWithRationale.aiRationale.trim(),
          niche: niche || 'AI Suggested', // Niche here will be the clean name from dropdown
          appSoftware: appSoftware || 'AI Suggested',
          source: 'AI Generated',
          priority: IdeaPriority.LOW,
          status: IdeaStatus.NEW,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          optimalKeywords: ideaWithRationale.keywords, // Assign initial keywords
          isScriptLoading: false,
          isExpanding: false,
          isYouTubeLoading: false,
          isKeywordsLoading: false,
          isTitleOptimizing: false,
          untappedScore: 'Not Assessed' as UntappedScore,
        }))
        .filter(idea => idea.text.length > 5 && idea.text.length < 200);

      const uniqueNewIdeas = newIdeas.filter(newIdea => 
        !ideas.some(existingIdea => existingIdea.text.toLowerCase() === newIdea.text.toLowerCase() && existingIdea.status !== IdeaStatus.DISCARDED)
      );
      
      setIdeas(prevIdeas => [...uniqueNewIdeas, ...prevIdeas].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      
      let message = '';
      if (strategicGuidance?.mainRecommendation && uniqueNewIdeas.length === 0 && newIdeas.length === 0) {
        message = `AI Strategy: ${strategicGuidance.mainRecommendation} No specific new video ideas generated for this strategy yet. Try refining or generating again.`;
        addFlashMessage('info', message);
      } else if (strategicGuidance?.mainRecommendation && uniqueNewIdeas.length > 0) {
        message = `AI Strategy: ${strategicGuidance.mainRecommendation} Additionally, ${uniqueNewIdeas.length} new ideas generated with rationale!`;
         addFlashMessage('success', message);
      } else if (uniqueNewIdeas.length > 0) {
        message = `${uniqueNewIdeas.length} new ideas generated with AI rationale!`;
        if (newIdeas.length - uniqueNewIdeas.length > 0) message += ` ${newIdeas.length - uniqueNewIdeas.length} duplicates ignored.`;
        addFlashMessage('success', message);
      } else if (newIdeas.length > 0) {
         addFlashMessage('info', `AI generated ${newIdeas.length} ideas, but they were already present or similar to existing ones.`);
      } else if (!strategicGuidance) {
        addFlashMessage('info', `AI didn't find any new ideas for this combination. Try different criteria!`);
      }

    } catch (error) {
      console.error("Error generating ideas:", error);
      let message = 'Failed to generate ideas. Ensure your API key is correctly configured and has quota.';
      if (error instanceof Error) {
        message = `Failed to generate ideas: ${error.message}`;
      }
      addFlashMessage('error', message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateIdea = (id: string, updates: Partial<VideoIdea>) => {
    setIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idea.id === id ? { ...idea, ...updates, lastUpdatedAt: new Date().toISOString() } : idea
      )
    );
    const nonFlashUpdateKeys = ['isScriptLoading', 'isExpanding', 'isYouTubeLoading', 'isKeywordsLoading', 'isTitleOptimizing', 'script', 'videoInstructions', 'suggestedResources', 'expandedIdeas', 'youtubeResults', 'optimalKeywords', 'suggestedKeywords', 'keywordSearchGroundingChunks', 'titleSuggestions', 'untappedScore', 'validationSummary', 'lastValidatedAt', 'aiRationale'];
    // Only show general update flash if it's not a background AI update AND not a status change (status changes have their own messages)
    if (!Object.keys(updates).some(key => nonFlashUpdateKeys.includes(key)) && !updates.status) {
        addFlashMessage('info', `Idea "${ideas.find(i=>i.id===id)?.text.substring(0,30)}..." updated.`);
    }
  };

  const handleDeleteIdea = (id: string) => {
    const ideaToDiscard = ideas.find(idea => idea.id === id);
    if (ideaToDiscard) {
        handleUpdateIdea(id, { status: IdeaStatus.DISCARDED });
        addFlashMessage('info', `Idea "${ideaToDiscard.text.substring(0,30)}..." moved to Discarded.`);
    }
  };

  const handleGenerateKeywords = async (ideaId: string) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (!targetIdea) {
      addFlashMessage('error', 'Could not find the idea to research keywords for.');
      return;
    }
    handleUpdateIdea(ideaId, { isKeywordsLoading: true });
    try {
      const { keywords, groundingChunks } = await generateKeywordsWithGemini(
        targetIdea.text,
        targetIdea.niche,
        targetIdea.appSoftware
      );
      const updatedIdeaWithKeywords: Partial<VideoIdea> = { 
        suggestedKeywords: keywords, 
        keywordSearchGroundingChunks: groundingChunks as GroundingChunk[] | undefined, 
        isKeywordsLoading: false, 
      };
      handleUpdateIdea(ideaId, updatedIdeaWithKeywords);
      if (keywords.length > 0) {
        addFlashMessage('success', `Keywords researched for "${targetIdea.text.substring(0,30)}...".`);
      } else {
        addFlashMessage('info', `No specific keywords returned by AI for "${targetIdea.text.substring(0,30)}...". Grounding sources may still be available.`);
      }
    } catch (error) {
      console.error("Error generating keywords:", error);
      addFlashMessage('error', `Failed to research keywords: ${error instanceof Error ? error.message : 'Unknown error'}`);
      handleUpdateIdea(ideaId, { isKeywordsLoading: false });
    }
  };

  const handleGenerateTitleSuggestions = async (ideaId: string) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (!targetIdea) {
      addFlashMessage('error', 'Could not find the idea to optimize title for.');
      return;
    }
    handleUpdateIdea(ideaId, { isTitleOptimizing: true });
    setSelectedIdeaForTitleOptimization({...targetIdea, isTitleOptimizing: true}); 
    setShowTitleOptimizerModal(true);
    try {
      const suggestions = await generateTitleSuggestionsWithGemini(
        targetIdea.text,
        targetIdea.niche,
        targetIdea.appSoftware,
        targetIdea.suggestedKeywords // Using suggestedKeywords, or optimalKeywords if preferred
      );
      const updatedIdeaWithTitles: Partial<VideoIdea> = { 
        titleSuggestions: suggestions,
        isTitleOptimizing: false, 
      };
      handleUpdateIdea(ideaId, updatedIdeaWithTitles);
      // Fetch the latest state of the idea to update the modal
      const currentIdeaForModal = ideas.find(i => i.id === ideaId);
      if (currentIdeaForModal) {
        setSelectedIdeaForTitleOptimization({ ...currentIdeaForModal, ...updatedIdeaWithTitles, isTitleOptimizing: false });
      }
      
      if (suggestions.length > 0) {
        addFlashMessage('success', `Title suggestions generated for "${targetIdea.text.substring(0,30)}...".`);
      } else {
        addFlashMessage('info', `AI could not generate title suggestions for "${targetIdea.text.substring(0,30)}...".`);
      }
    } catch (error) {
      console.error("Error generating title suggestions:", error);
      addFlashMessage('error', `Failed to generate title suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const currentIdeaState = ideas.find(i => i.id === ideaId); 
      setSelectedIdeaForTitleOptimization(currentIdeaState ? {...currentIdeaState, isTitleOptimizing: false, titleSuggestions: currentIdeaState.titleSuggestions || [{suggestedTitle: "Error during generation.", rationale: ""}]} : null);
      handleUpdateIdea(ideaId, { isTitleOptimizing: false });
    }
  };
  
  const handleApplyOptimizedTitle = (ideaId: string, newTitle: string) => {
    handleUpdateIdea(ideaId, { text: newTitle, titleSuggestions: undefined }); 
    addFlashMessage('success', `Title updated for idea!`);
    setShowTitleOptimizerModal(false);
    setSelectedIdeaForTitleOptimization(null);
  };

  const handleGenerateScriptAndInstructions = async (ideaId: string, lengthMinutes: number) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (!targetIdea) {
      addFlashMessage('error', 'Could not find the idea to generate script for.');
      return;
    }
    handleUpdateIdea(ideaId, { isScriptLoading: true });
    setSelectedIdeaForScript({...targetIdea, isScriptLoading: true});
    setShowScriptModal(true); 
    
    try {
      const { script, instructions, resources } = await generateVideoScriptAndInstructions(
        targetIdea.text,
        targetIdea.niche,
        targetIdea.appSoftware,
        lengthMinutes,
        targetIdea.suggestedKeywords || targetIdea.optimalKeywords // Use suggested or optimal keywords
      );
      const updatedIdeaWithScript: Partial<VideoIdea> = { script, videoInstructions: instructions, suggestedResources: resources, scriptLengthMinutes: lengthMinutes, isScriptLoading: false };
      handleUpdateIdea(ideaId, updatedIdeaWithScript);
       // Fetch the latest state of the idea to update the modal
      const currentIdeaForModal = ideas.find(i => i.id === ideaId);
      if (currentIdeaForModal) {
        setSelectedIdeaForScript({ ...currentIdeaForModal, ...updatedIdeaWithScript, isScriptLoading: false });
      }
      addFlashMessage('success', `Script & instructions generated for "${targetIdea.text.substring(0,30)}...". ${(targetIdea.suggestedKeywords || targetIdea.optimalKeywords) ? 'Keywords were considered.' : ''}`);
    } catch (error) {
      console.error("Error generating script:", error);
      addFlashMessage('error', `Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const currentIdeaState = ideas.find(i => i.id === ideaId);
      setSelectedIdeaForScript(currentIdeaState ? {...currentIdeaState, isScriptLoading: false, script: currentIdeaState.script || "Error during generation."} : null);
      handleUpdateIdea(ideaId, { isScriptLoading: false });
    }
  };
  
  const handleShowScriptModal = (ideaId: string) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (targetIdea && (targetIdea.script || targetIdea.isScriptLoading || targetIdea.suggestedKeywords || targetIdea.optimalKeywords || targetIdea.titleSuggestions)) { 
        setSelectedIdeaForScript(targetIdea);
        setShowScriptModal(true);
    } else {
        addFlashMessage('info', 'No generated content available for this idea yet. Please generate it first.');
    }
  };

  const handleExpandIdea = async (ideaId: string) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (!targetIdea) {
      addFlashMessage('error', 'Could not find the idea to expand.');
      return;
    }
    handleUpdateIdea(ideaId, { isExpanding: true });
    try {
      // expandIdeaIntoRelatedIdeas returns Array<{text: string, keywords: string[]}>
      const relatedIdeaObjects = await expandIdeaIntoRelatedIdeas(
        targetIdea.text,
        targetIdea.niche,
        targetIdea.appSoftware
      );

      const newExpandedIdeas: VideoIdea[] = relatedIdeaObjects
        .map(expandedIdeaObj => ({ // expandedIdeaObj is {text: string, keywords: string[]}
          id: crypto.randomUUID(),
          text: expandedIdeaObj.text.trim(),
          optimalKeywords: expandedIdeaObj.keywords, // Assign expanded keywords to optimalKeywords
          niche: targetIdea.niche, 
          appSoftware: targetIdea.appSoftware,
          source: `Expanded from "${targetIdea.text.substring(0,25)}..."`,
          priority: IdeaPriority.LOW, 
          status: IdeaStatus.NEW,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          isScriptLoading: false, 
          isExpanding: false,
          isYouTubeLoading: false,
          isKeywordsLoading: false,
          isTitleOptimizing: false,
          untappedScore: 'Not Assessed' as UntappedScore,
          aiRationale: `Expanded from an existing idea. Original rationale: ${targetIdea.aiRationale || 'N/A'}`
        }))
        .filter(idea => idea.text.length > 5 && idea.text.length < 200);
      
      const uniqueNewExpandedIdeas = newExpandedIdeas.filter(newIdea => 
        !ideas.some(existingIdea => existingIdea.text.toLowerCase() === newIdea.text.toLowerCase() && existingIdea.status !== IdeaStatus.DISCARDED)
      );
      
      const updatedOriginalIdea: Partial<VideoIdea> = {
        expandedIdeas: uniqueNewExpandedIdeas.map(i => i.text), // Keep original string array if used
        expandedIdeasWithKeywords: uniqueNewExpandedIdeas.map(i => ({ text: i.text, keywords: i.optimalKeywords || [] })),
        isExpanding: false
      };
      
      setIdeas(prevIdeas => 
        [...uniqueNewExpandedIdeas, ...prevIdeas.map(i => (i.id === ideaId ? { ...i, ...updatedOriginalIdea, lastUpdatedAt: new Date().toISOString() } : i))]
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );

      if (uniqueNewExpandedIdeas.length > 0) {
        addFlashMessage('success', `${uniqueNewExpandedIdeas.length} related ideas generated and added to 'New'.`);
      } else if (relatedIdeaObjects.length > 0) {
        addFlashMessage('info', 'AI generated related ideas, but they were duplicates or too similar.');
      } else {
        addFlashMessage('info', 'AI could not generate further related ideas for this topic.');
      }

    } catch (error) {
      console.error("Error expanding idea:", error);
      addFlashMessage('error', `Failed to expand idea: ${error instanceof Error ? error.message : 'Unknown error'}`);
      handleUpdateIdea(ideaId, { isExpanding: false });
    }
  };
  
  const YOUTUBE_VALIDATION_CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

  const analyzeYouTubeResults = (results: YouTubeVideoResult[]): { score: UntappedScore; summary: string } => {
    const count = results.length;
    let summary = `${count} similar video(s) found. `;
    let score: UntappedScore = 'Not Assessed';

    if (count === 0) {
      summary += "Excellent untapped potential!";
      score = 'High';
    } else {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const recentVideos = results.filter(v => v.publishedAtDate && v.publishedAtDate > sixMonthsAgo);
      const veryOldVideos = results.filter(v => v.publishedAtDate && v.publishedAtDate < oneYearAgo);
      
      const newestVideo = results.reduce((newest, current) => {
        if (!current.publishedAtDate) return newest;
        if (!newest || !newest.publishedAtDate || current.publishedAtDate > newest.publishedAtDate) {
            return current;
        }
        return newest;
      }, null as YouTubeVideoResult | null);
      
      if (newestVideo?.publishedAtText) {
        summary += `Newest relevant video is ~${newestVideo.publishedAtText}. `;
      }

      if (count <= 2) {
        if (veryOldVideos.length === count) {
          summary += "Strong untapped potential due to age of existing content.";
          score = 'High';
        } else if (recentVideos.length < count) {
          summary += "Good untapped potential, existing content may not be fresh.";
          score = 'Medium';
        } else {
          summary += "Some competition, but opportunity may exist with a unique angle.";
          score = 'Medium';
        }
      } else if (count <= 4) { // "Fewer than 5" includes up to 4
        if (veryOldVideos.length >= count / 2) {
          summary += "Medium untapped potential, many existing videos are old.";
          score = 'Medium';
        } else {
          summary += "Moderate competition. Focus on differentiation.";
          score = 'Low';
        }
      } else {
        summary += "Significant competition. Requires a very unique angle or superior quality.";
        score = 'Low';
      }
    }
    return { score, summary };
  };


  const handleShowYouTubeValidation = async (ideaId: string, forceRefresh: boolean = false) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (!targetIdea) {
      addFlashMessage('error', 'Could not find the idea for YouTube validation.');
      return;
    }

    // Check cache
    if (!forceRefresh && targetIdea.youtubeResults && targetIdea.lastValidatedAt) {
      const lastValidationTime = new Date(targetIdea.lastValidatedAt).getTime();
      if (Date.now() - lastValidationTime < YOUTUBE_VALIDATION_CACHE_DURATION) {
        setSelectedIdeaForYouTube(targetIdea); // Show cached data
        setShowYouTubeModal(true);
        if(targetIdea.validationSummary) addFlashMessage('info', `Showing cached validation: ${targetIdea.validationSummary}`);
        return;
      }
    }

    handleUpdateIdea(ideaId, { isYouTubeLoading: true, untappedScore: 'Not Assessed' as UntappedScore, validationSummary: 'Validating...' });
    setSelectedIdeaForYouTube({...targetIdea, isYouTubeLoading: true, untappedScore: 'Not Assessed' as UntappedScore, validationSummary: 'Validating...'});
    setShowYouTubeModal(true);

    try {
      const results = await searchYouTubeForExistingVideos(targetIdea.text, 5); // Fetch up to 5 results
      const { score, summary } = analyzeYouTubeResults(results);
      
      const updatedIdeaWithYT: Partial<VideoIdea> = { 
        youtubeResults: results, 
        isYouTubeLoading: false, 
        untappedScore: score,
        validationSummary: summary,
        lastValidatedAt: new Date().toISOString(),
      };
      handleUpdateIdea(ideaId, updatedIdeaWithYT);
      // Fetch the latest state of the idea to update the modal
      const currentIdeaForModal = ideas.find(i => i.id === ideaId);
      if (currentIdeaForModal) {
        setSelectedIdeaForYouTube({ ...currentIdeaForModal, ...updatedIdeaWithYT });
      }

      if (results.length === 0) {
        addFlashMessage('success', `No existing YouTube videos found for "${targetIdea.text.substring(0,30)}...". High untapped potential!`);
      } else {
        addFlashMessage('info', `Validation for "${targetIdea.text.substring(0,30)}...": ${summary}`);
      }
    } catch (error) {
      console.error("Error fetching YouTube validation:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addFlashMessage('error', `Failed to fetch YouTube videos: ${errorMessage}`);
      const currentIdeaState = ideas.find(i => i.id === ideaId);
      const errorUpdate: Partial<VideoIdea> = {
        isYouTubeLoading: false, 
        untappedScore: 'Error' as UntappedScore,
        validationSummary: `Error: ${errorMessage}`,
        youtubeResults: currentIdeaState?.youtubeResults || [{title: "Error fetching results", videoId: "error"}]
      };
      setSelectedIdeaForYouTube(currentIdeaState ? {...currentIdeaState, ...errorUpdate } : null);
      handleUpdateIdea(ideaId, errorUpdate);
    }
  };
  
  const categorizedIdeas: CategorizedIdeas = ideas.reduce(
    (acc, idea) => {
      if (!acc[idea.status]) acc[idea.status] = []; 
      acc[idea.status].push(idea);
      return acc;
    },
    {
      [IdeaStatus.NEW]: [],
      [IdeaStatus.PRIORITIZED]: [],
      [IdeaStatus.IN_PROGRESS]: [],
      [IdeaStatus.VIDEO_MADE]: [],
      // [IdeaStatus.ARCHIVED]: [], // Removed Archived
      [IdeaStatus.DISCARDED]: [],
    } as CategorizedIdeas
  );

  if (isLoading && (!process.env.API_KEY || process.env.API_KEY === "MISSING_API_KEY_WILL_FAIL" || process.env.API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE") && !getAllIdeas(currentProfile).length) { 
      return (
        <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center justify-center p-4 text-center">
          <div className="glass-card p-8 rounded-xl shadow-xl max-w-md border border-red-500/50">
            <h1 className="text-3xl font-bold mb-4 text-red-400">⚠️ Gemini API Key Missing or Placeholder</h1>
            <p className="text-lg mb-2">The Gemini API Key (process.env.API_KEY) is not correctly configured.</p>
            <p className="mb-1">Please create a <code className="bg-gray-700/50 px-2 py-1 rounded-md text-yellow-300">.env.local</code> file in the project root.</p>
            <p className="mb-1">Add your key like this: <code className="bg-gray-700/50 px-1 py-0.5 rounded-md text-yellow-300 whitespace-pre">API_KEY="YOUR_KEY_HERE"</code></p>
            <p className="mb-4">For YouTube features, also add: <code className="bg-gray-700/50 px-1 py-0.5 rounded-md text-yellow-300 whitespace-pre">YOUTUBE_API_KEY="YOUR_KEY_HERE"</code></p>
            <p className="text-sm text-gray-400">If you've just set it, please save the file and refresh the application.</p>
            <p className="text-sm text-gray-400 mt-2">Without valid keys, AI features will use mock data or fail.</p>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8">
      <FlashMessageDisplay messages={flashMessages} onClose={(id) => setFlashMessages(prev => prev.filter(fm => fm.id !== id))} />
      <Header 
        currentProfile={currentProfile} 
        allProfiles={allProfiles}
        onActivateProfile={handleActivateProfile} 
      />
      
      <main className="mt-8 space-y-12">
        {!currentProfile && allProfiles.length === 0 && (
            <div className="text-center py-10 glass-card">
                <p className="text-xl text-gray-300">Welcome! Create your first profile in the header to get started.</p>
            </div>
        )}
        {!currentProfile && allProfiles.length > 0 && (
            <div className="text-center py-10 glass-card">
                <p className="text-xl text-gray-300">Please select a profile from the dropdown above, or create a new one.</p>
            </div>
        )}

        {currentProfile && (
            <>
                <IdeaForm 
                    onGenerate={handleGenerateIdeas} 
                    isLoading={isGenerating}
                />

                {proactiveRecommendations?.mainRecommendation && !isGenerating && (
                  <CollapsibleSection 
                    title="🌟 AI Strategic Guidance" 
                    defaultOpen={true}
                    className="my-8 !rounded-xl !border-blue-500/30 animate-fadeIn"
                    headerClassName="!text-2xl !font-semibold !bg-clip-text !text-transparent !bg-gradient-to-r !from-blue-400 !to-cyan-300 !py-5"
                    contentClassName="!p-5"
                  >
                    <p className="text-lg text-gray-200 leading-relaxed">{proactiveRecommendations.mainRecommendation}</p>
                  </CollapsibleSection>
                )}
                {isLoading && !isGenerating ? (
                  <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="ml-4 text-xl text-gray-300">Loading ideas for {currentProfile}...</p>
                  </div>
                ) : (
                  <div className="space-y-8 md:space-y-10">
                    {Object.values(IdeaStatus).map(status => {
                      // Removed IdeaStatus.ARCHIVED check as it's no longer in the enum
                      
                      let ideasToList = categorizedIdeas[status] || [];
                      if (status === IdeaStatus.VIDEO_MADE || status === IdeaStatus.DISCARDED ) {
                        ideasToList = [...ideasToList].sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()).slice(0, 30);
                      } else {
                         ideasToList = [...ideasToList].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                      }

                      return (
                        <IdeaSection
                          key={status}
                          title={`${status} (${ideasToList.length})`}
                          ideas={ideasToList}
                          status={status}
                          onUpdateIdea={handleUpdateIdea}
                          onDeleteIdea={handleDeleteIdea}
                          onGenerateKeywords={handleGenerateKeywords}
                          onGenerateScriptAndInstructions={handleGenerateScriptAndInstructions}
                          onShowScriptModal={handleShowScriptModal}
                          onExpandIdea={handleExpandIdea}
                          onShowYouTubeValidation={handleShowYouTubeValidation}
                          onGenerateTitleSuggestions={handleGenerateTitleSuggestions}
                        />
                      );
                    })}
                  </div>
                )}
            </>
        )}
      </main>

      {selectedIdeaForScript && (
        <ScriptViewerModal
          isOpen={showScriptModal}
          onClose={() => { setShowScriptModal(false); setSelectedIdeaForScript(null); }}
          idea={selectedIdeaForScript}
        />
      )}

      {selectedIdeaForYouTube && (
        <YouTubeViewerModal
          isOpen={showYouTubeModal}
          onClose={() => { setShowYouTubeModal(false); setSelectedIdeaForYouTube(null);}}
          idea={selectedIdeaForYouTube}
          onForceRefreshValidation={handleShowYouTubeValidation}
        />
      )}

      {selectedIdeaForTitleOptimization && (
        <TitleOptimizerModal
          isOpen={showTitleOptimizerModal}
          onClose={() => { setShowTitleOptimizerModal(false); setSelectedIdeaForTitleOptimization(null); }}
          idea={selectedIdeaForTitleOptimization}
          onApplyTitle={(newTitle) => handleApplyOptimizedTitle(selectedIdeaForTitleOptimization.id, newTitle)}
          isOptimizing={selectedIdeaForTitleOptimization.isTitleOptimizing || false}
        />
      )}

      <footer className="text-center mt-16 mb-8 py-6 border-t border-gray-800/50 text-gray-500">
        <p>&copy; {new Date().getFullYear()} YouTube Idea Command Center. AI-Powered Strategy & Creation.</p>
      </footer>
    </div>
  );
};

export default App;
