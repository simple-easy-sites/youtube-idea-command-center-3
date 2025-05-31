
import React, { useState, useEffect, useCallback } from 'react';
import { IdeaStatus, VideoIdea, CategorizedIdeas, FlashMessage, IdeaPriority, AIStrategicGuidance, GroundingChunk, TitleSuggestion, UntappedScore, YouTubeVideoResult, NEW_HIGH_RPM_CATEGORIES } from './types';
import { Header } from './components/Header';
import { IdeaForm } from './components/IdeaForm';
import { IdeaSection } from './components/IdeaSection';
import { FlashMessageDisplay } from './components/FlashMessageDisplay';
import { generateIdeasWithGemini, expandIdeaIntoRelatedIdeas, generateKeywordsWithGemini, generateTitleSuggestionsWithGemini, analyzeYouTubeCompetitorsForAngles, generateVideoScriptAndInstructions } from './services/geminiService';
import { getAllIdeas, saveAllIdeas, getLastActiveProfile, saveLastActiveProfile, getAllProfiles, saveAllProfiles } from './services/localStorageService';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ScriptViewerModal } from './components/ScriptViewerModal'; // Re-added
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
  
  const [selectedIdeaForScript, setSelectedIdeaForScript] = useState<VideoIdea | null>(null); // Re-added
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false); // Re-added
  
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
      // Check process.env.API_KEY for Gemini, and import.meta.env.VITE_YOUTUBE_API_KEY for YouTube
      if(loadedIdeas.length === 0 && process.env.API_KEY && process.env.API_KEY !== "MISSING_API_KEY_WILL_FAIL" && process.env.API_KEY !== "YOUR_ACTUAL_GEMINI_API_KEY_HERE") { 
        addFlashMessage('info', `Switched to profile '${currentProfile}'. Generate some ideas or let the AI suggest a strategy.`);
      }
    } else {
      // No profile selected, clear ideas and set loading to false (or handle as "no profile selected" state)
      setIdeas([]);
      setIsLoading(false);
       // Check process.env.API_KEY for Gemini
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


  const handleGenerateIdeas = async (userQuery: string, niche: string, appSoftware: string, tutorialType: string) => {
    if (!currentProfile) {
      addFlashMessage('error', 'Please select or create a profile before generating ideas.');
      return;
    }
    if (!niche && !appSoftware && !userQuery && !tutorialType) {
      addFlashMessage('error', 'Please provide some input (Niche, App, Tutorial Type, or Refinement) to generate ideas.');
      return;
    }
    setIsGenerating(true);
    setProactiveRecommendations(null);
    try {
      const { ideas: generatedIdeasWithRationale, strategicGuidance } = await generateIdeasWithGemini(userQuery, niche, appSoftware, tutorialType, NEW_HIGH_RPM_CATEGORIES);
      
      if (strategicGuidance) {
        setProactiveRecommendations(strategicGuidance); 
      }

      const newIdeas: VideoIdea[] = generatedIdeasWithRationale
        .map(ideaWithRationale => ({
          id: crypto.randomUUID(),
          text: ideaWithRationale.text.trim(),
          aiRationale: ideaWithRationale.aiRationale.trim(),
          niche: niche || 'AI Suggested', 
          appSoftware: appSoftware || 'AI Suggested',
          // tutorialType: tutorialType, // Store if needed on idea itself, for now it's an input to generation
          source: 'AI Generated',
          priority: IdeaPriority.LOW,
          status: IdeaStatus.NEW,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          optimalKeywords: ideaWithRationale.keywords, 
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
      let message = 'Failed to generate ideas. Ensure your API key (process.env.API_KEY for Gemini) is correctly configured and has quota.';
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
    const nonFlashUpdateKeys = ['isScriptLoading', 'isExpanding', 'isYouTubeLoading', 'isKeywordsLoading', 'isTitleOptimizing', 'script', 'videoInstructions', 'suggestedResources', 'expandedIdeas', 'youtubeResults', 'optimalKeywords', 'suggestedKeywords', 'keywordSearchGroundingChunks', 'titleSuggestions', 'untappedScore', 'validationSummary', 'lastValidatedAt', 'aiRationale', 'aiCompetitiveAngle'];
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
        targetIdea.suggestedKeywords 
      );
      const updatedIdeaWithTitles: Partial<VideoIdea> = { 
        titleSuggestions: suggestions,
        isTitleOptimizing: false, 
      };
      handleUpdateIdea(ideaId, updatedIdeaWithTitles);
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

  const handleExpandIdea = async (ideaId: string) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (!targetIdea) {
      addFlashMessage('error', 'Could not find the idea to expand.');
      return;
    }
    handleUpdateIdea(ideaId, { isExpanding: true });
    try {
      const relatedIdeaObjects = await expandIdeaIntoRelatedIdeas(
        targetIdea.text,
        targetIdea.niche,
        targetIdea.appSoftware
      );

      const newExpandedIdeas: VideoIdea[] = relatedIdeaObjects
        .map(expandedIdeaObj => ({ 
          id: crypto.randomUUID(),
          text: expandedIdeaObj.text.trim(),
          optimalKeywords: expandedIdeaObj.keywords, 
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
        expandedIdeas: uniqueNewExpandedIdeas.map(i => i.text), 
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

  const analyzeYouTubeResults = (results: YouTubeVideoResult[], ideaText: string): { score: UntappedScore; summary: string } => {
    const count = results.length;
    let summary = `${count} similar video(s) found by YouTube search. `;
    let score: UntappedScore = 'Not Assessed';

    if (count === 0) {
        summary += "Suggests strong untapped potential based on initial search!";
        score = 'High';
    } else {
        const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentVideos = results.filter(v => v.publishedAtDate && v.publishedAtDate > threeMonthsAgo);
        const moderatelyOldVideos = results.filter(v => v.publishedAtDate && v.publishedAtDate <= sixMonthsAgo && v.publishedAtDate > oneYearAgo);
        const veryOldVideos = results.filter(v => v.publishedAtDate && v.publishedAtDate <= oneYearAgo);
        
        const newestVideo = results.reduce((newest, current) => {
            if (!current.publishedAtDate) return newest;
            if (!newest || !newest.publishedAtDate || current.publishedAtDate > newest.publishedAtDate) return current;
            return newest;
        }, null as YouTubeVideoResult | null);
        
        if (newestVideo?.publishedAtText) {
            summary += `Newest relevant video is ~${newestVideo.publishedAtText}. `;
        }

        // Consider low sub count with high views
        const highDemandIndicators = results.filter(v => {
            const subsText = v.channelSubscriberCountText || "0";
            const viewsText = v.viewCountText || "0";
            const subs = parseInt(subsText.replace(/\D/g, ''));
            const views = parseInt(viewsText.replace(/\D/g, ''));
            if (isNaN(subs) || isNaN(views)) return false;
            if (subsText.includes('M')) return false; // Ignore massive channels for this specific indicator
            return subs < 20000 && views > 50000; // Example: <20k subs, >50k views
        });

        if (highDemandIndicators.length > 0) {
            summary += `Noteworthy: ${highDemandIndicators.length} video(s) from smaller channels have high views, suggesting strong topic interest! `;
        }

        if (count <= 3) { // 0-3 videos
            if (recentVideos.length === 0 && count > 0) { // Existing videos are not recent
                summary += "Strong potential due to lack of fresh content."; score = 'High';
            } else if (highDemandIndicators.length > 0) {
                summary += "High potential, especially if leveraging insights from successful smaller channels."; score = 'High';
            } else {
                summary += "Good potential, limited direct competition."; score = 'Medium';
            }
        } else if (count <= 7) { // 4-7 videos
            if (recentVideos.length <= 1 && veryOldVideos.length >= count / 2) {
                summary += "Medium potential; opportunity to update older content or find a fresh angle."; score = 'Medium';
            } else if (highDemandIndicators.length > 0) {
                 summary += "Medium potential; strong topic interest indicated. Focus on differentiation."; score = 'Medium';
            } else {
                summary += "Moderate competition. Differentiation is key."; score = 'Low';
            }
        } else { // 8+ videos
             if (highDemandIndicators.length >= 2) {
                summary += "Competitive, but clear demand exists. A highly unique or superior quality video is needed."; score = 'Medium';
             } else if (recentVideos.length < 3 && veryOldVideos.length > count / 2) {
                summary += "Competitive, but many videos are old. An updated, high-quality version could succeed."; score = 'Low';
             }
             else {
                summary += "Significant competition. Requires a very unique angle or superior quality to stand out."; score = 'Low';
             }
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

    if (!forceRefresh && targetIdea.youtubeResults && targetIdea.lastValidatedAt && targetIdea.aiCompetitiveAngle) {
      const lastValidationTime = new Date(targetIdea.lastValidatedAt).getTime();
      if (Date.now() - lastValidationTime < YOUTUBE_VALIDATION_CACHE_DURATION) {
        setSelectedIdeaForYouTube(targetIdea); 
        setShowYouTubeModal(true);
        if(targetIdea.validationSummary) addFlashMessage('info', `Showing cached validation: ${targetIdea.validationSummary}`);
        return;
      }
    }

    handleUpdateIdea(ideaId, { isYouTubeLoading: true, untappedScore: 'Not Assessed' as UntappedScore, validationSummary: 'Validating...', aiCompetitiveAngle: 'Analyzing...' });
    setSelectedIdeaForYouTube({...targetIdea, isYouTubeLoading: true, untappedScore: 'Not Assessed' as UntappedScore, validationSummary: 'Validating...', aiCompetitiveAngle: 'Analyzing...'});
    setShowYouTubeModal(true);

    try {
      const results = await searchYouTubeForExistingVideos(targetIdea.text, 10); // Fetch up to 10 results
      const { score, summary } = analyzeYouTubeResults(results, targetIdea.text);
      
      let aiAngle = "AI is analyzing competitor angles...";
      if (results.length > 0) {
          // Update UI immediately with interim analysis before AI angle
          const interimUpdate: Partial<VideoIdea> = { 
            youtubeResults: results, 
            untappedScore: score,
            validationSummary: summary,
            isYouTubeLoading: true, // Keep loading true until AI angle is fetched
            lastValidatedAt: new Date().toISOString(),
            aiCompetitiveAngle: aiAngle 
          };
          handleUpdateIdea(ideaId, interimUpdate);
          const currentIdeaForModalInterim = ideas.find(i => i.id === ideaId);
          if (currentIdeaForModalInterim) {
            setSelectedIdeaForYouTube({ ...currentIdeaForModalInterim, ...interimUpdate });
          }
          
          // Now fetch AI competitive angle
          aiAngle = await analyzeYouTubeCompetitorsForAngles(targetIdea.text, results);
      } else {
          aiAngle = "AI STRATEGIC ANGLE:\nOverall Assessment: No direct competitor videos found in the top 10 search results.\nActionable Angles:\n* This suggests a strong opportunity to be one of the first to cover this specific topic.\n* Focus on creating a comprehensive, high-quality foundational video.\n* Ensure thorough keyword research to capture initial search interest.";
      }
      
      const finalUpdate: Partial<VideoIdea> = { 
        youtubeResults: results, 
        isYouTubeLoading: false, 
        untappedScore: score,
        validationSummary: summary,
        aiCompetitiveAngle: aiAngle, // Store the AI's strategic angle
        lastValidatedAt: new Date().toISOString(),
      };
      handleUpdateIdea(ideaId, finalUpdate);
      const currentIdeaForModalFinal = ideas.find(i => i.id === ideaId);
      if (currentIdeaForModalFinal) {
        setSelectedIdeaForYouTube({ ...currentIdeaForModalFinal, ...finalUpdate });
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
        aiCompetitiveAngle: "AI analysis could not be performed due to an error.",
        youtubeResults: currentIdeaState?.youtubeResults || [{title: "Error fetching results", videoId: "error"}]
      };
      setSelectedIdeaForYouTube(currentIdeaState ? {...currentIdeaState, ...errorUpdate } : null);
      handleUpdateIdea(ideaId, errorUpdate);
    }
  };
  
  const handleGenerateScriptAndInstructions = async (ideaId: string, targetLengthMinutes: number) => {
    const targetIdea = ideas.find(idea => idea.id === ideaId);
    if (!targetIdea) {
      addFlashMessage('error', 'Could not find the idea to generate script for.');
      return;
    }
    handleUpdateIdea(ideaId, { isScriptLoading: true, scriptLengthMinutes: targetLengthMinutes, script: "Generating...", videoInstructions: "Generating...", suggestedResources: [] });
    setSelectedIdeaForScript({...targetIdea, isScriptLoading: true, scriptLengthMinutes: targetLengthMinutes, script: "Generating..."}); // Open modal immediately with loading state
    setShowScriptModal(true);

    try {
      const { script, videoInstructions, suggestedResources } = await generateVideoScriptAndInstructions(
        targetIdea.text,
        targetIdea.niche,
        targetIdea.appSoftware,
        targetLengthMinutes,
        targetIdea.suggestedKeywords || targetIdea.optimalKeywords,
        targetIdea.aiCompetitiveAngle
      );
      const updatedIdeaWithScript: Partial<VideoIdea> = { 
        script, 
        videoInstructions, 
        suggestedResources,
        scriptLengthMinutes: targetLengthMinutes,
        isScriptLoading: false 
      };
      handleUpdateIdea(ideaId, updatedIdeaWithScript);
      const currentIdeaForModal = ideas.find(i => i.id === ideaId); // Get the absolute latest version
        if (currentIdeaForModal) {
            setSelectedIdeaForScript({ ...currentIdeaForModal, ...updatedIdeaWithScript, isScriptLoading: false });
        }


      addFlashMessage('success', `Script generated for "${targetIdea.text.substring(0,30)}...".`);
    } catch (error) {
      console.error("Error generating script:", error);
      addFlashMessage('error', `Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const currentIdeaState = ideas.find(i => i.id === ideaId);
      const errorUpdate: Partial<VideoIdea> = { 
          isScriptLoading: false, 
          script: "Error during script generation. Please try again.",
          videoInstructions: "Could not generate instructions.",
          suggestedResources: []
      };
      setSelectedIdeaForScript(currentIdeaState ? {...currentIdeaState, ...errorUpdate} : null);
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
      [IdeaStatus.DISCARDED]: [],
    } as CategorizedIdeas
  );

  const isGeminiApiKeyMissingOrPlaceholder = !process.env.API_KEY || process.env.API_KEY === "MISSING_API_KEY_WILL_FAIL" || process.env.API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE";
  const isYouTubeApiKeyMissingOrPlaceholder = !import.meta.env.VITE_YOUTUBE_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY === "MISSING_YOUTUBE_API_KEY" || import.meta.env.VITE_YOUTUBE_API_KEY === "YOUR_ACTUAL_YOUTUBE_API_KEY_HERE";

  if (isLoading && (isGeminiApiKeyMissingOrPlaceholder || isYouTubeApiKeyMissingOrPlaceholder) && !getAllIdeas(currentProfile).length) { 
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-800/70 p-8 rounded-xl shadow-2xl max-w-lg border-2 border-red-500 backdrop-blur-md">
            <h1 className="text-4xl font-bold mb-6 text-yellow-300">⚠️ API Key Configuration Issue</h1>
            {isGeminiApiKeyMissingOrPlaceholder && (
                <p className="text-lg mb-3">The Gemini API Key (<code className="bg-slate-700 px-1 py-0.5 rounded">API_KEY</code> at <code className="bg-slate-700 px-1 py-0.5 rounded">process.env.API_KEY</code>) is missing or uses a placeholder.</p>
            )}
            {isYouTubeApiKeyMissingOrPlaceholder && (
                <p className="text-lg mb-3">The YouTube API Key (<code className="bg-slate-700 px-1 py-0.5 rounded">VITE_YOUTUBE_API_KEY</code>) is missing or uses a placeholder.</p>
            )}
            <p className="mb-2">Please ensure these are correctly set in your Vercel Project Settings &gt; Environment Variables and the project is redeployed. Ensure <code className="bg-slate-700 px-1 py-0.5 rounded">API_KEY</code> (for Gemini) is available as <code className="bg-slate-700 px-1 py-0.5 rounded">process.env.API_KEY</code> in the frontend build.</p>
            <p className="text-md text-gray-300 mb-5">Example: <code className="bg-slate-700 px-1 py-0.5 rounded whitespace-pre">API_KEY="your_actual_gemini_key"</code> (for Gemini)</p>
            <p className="text-md text-gray-300 mb-5">Example: <code className="bg-slate-700 px-1 py-0.5 rounded whitespace-pre">VITE_YOUTUBE_API_KEY="your_actual_youtube_key"</code> (for YouTube)</p>
            <p className="text-sm text-gray-400">If you've just set them, ensure the Vercel project has been redeployed. The app will use mock data or fail until valid keys are provided.</p>
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
                          onExpandIdea={handleExpandIdea}
                          onShowYouTubeValidation={handleShowYouTubeValidation}
                          onGenerateTitleSuggestions={handleGenerateTitleSuggestions}
                          onGenerateScriptAndInstructions={handleGenerateScriptAndInstructions} // Added
                          onShowScriptModal={(idea) => { setSelectedIdeaForScript(idea); setShowScriptModal(true);}} // Added
                        />
                      );
                    })}
                  </div>
                )}
            </>
        )}
      </main>

      {selectedIdeaForScript && ( // Re-added
        <ScriptViewerModal
          isOpen={showScriptModal}
          onClose={() => { setShowScriptModal(false); setSelectedIdeaForScript(null);}}
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