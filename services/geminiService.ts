

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingChunk, TitleSuggestion, AIStrategicGuidance, YouTubeVideoResult, NicheDefinition, USER_DEFINED_NICHES, TutorialType } from '../types';
import { parseISO8601Duration } from './youtubeService'; // Import the function

// Attempt to use process.env.API_KEY first, then fallback to import.meta.env.VITE_API_KEY
let apiKeyToUse = process.env.API_KEY;
let apiKeySource = "process.env.API_KEY";

if (!apiKeyToUse || apiKeyToUse === "MISSING_API_KEY_WILL_FAIL" || apiKeyToUse === "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
  // console.log(`Gemini Service: process.env.API_KEY ('${apiKeyToUse}') is missing or a placeholder. Checking fallback VITE_API_KEY.`);
  const viteApiKey = import.meta.env.VITE_API_KEY;
  if (viteApiKey && viteApiKey !== "MISSING_API_KEY_WILL_FAIL" && viteApiKey !== "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
    apiKeyToUse = viteApiKey;
    apiKeySource = "import.meta.env.VITE_API_KEY (fallback)";
    console.warn(`Gemini Service: Using fallback API_KEY from import.meta.env.VITE_API_KEY. For production/Vercel, ensure API_KEY is set as a non-prefixed environment variable for the backend/build process if possible, or that VITE_API_KEY is correctly managed for frontend-only SDK use.`);
  } else {
    // console.log(`Gemini Service: Fallback import.meta.env.VITE_API_KEY ('${viteApiKey}') is also missing or a placeholder.`);
  }
}


const GEMINI_API_KEY = apiKeyToUse;
let ai: GoogleGenAI | null = null;

// Determine if mock data should be used based on the API key status
const shouldUseMockData = !GEMINI_API_KEY || GEMINI_API_KEY === "MISSING_API_KEY_WILL_FAIL" || GEMINI_API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE";

if (shouldUseMockData) {
  console.warn(`Gemini Service: API_KEY (checked from ${apiKeySource}, current value: '${GEMINI_API_KEY}') is missing, a placeholder, or SDK initialization is deliberately skipped. AI features will use mock data. Gemini SDK will not be initialized for live calls.`);
} else if (GEMINI_API_KEY) {
  // Only attempt to initialize if GEMINI_API_KEY is present and not a placeholder
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    // console.log(`Gemini Service: SDK initialized successfully using API_KEY from ${apiKeySource}.`);
  } catch (error) {
    console.error(`Gemini Service: Failed to initialize GoogleGenAI SDK using API_KEY from ${apiKeySource}. Error:`, error);
    // ai remains null. Functions should handle this.
  }
}

// 1. REPLACED sanitizeAIResponseText FUNCTION (with further refinement)
const sanitizeAIResponseText = (text: string | undefined): string => {
  if (!text) return '';
  
  try {
    let cleaned = text
      .replace(/\r\n/g, '\n') // Normalize line endings first
      .replace(/\r/g, '\n');

    // Remove specific problematic Unicode replacement char (U+FFFD)
    // and C0 control characters (0x00-0x1F) excluding Tab (0x09), LF (0x0A), CR (0x0D),
    // plus the DEL character (0x7F).
    // NUL (\x00) is covered by \x00-\x08.
    cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD]/g, "");
    
    cleaned = cleaned.trim(); // Trim after all replacements
    
    // Test if the text is valid UTF-8 and try to fix minor issues
    try {
      // This can help fix some subtly broken UTF-8 sequences or validate it.
      return decodeURIComponent(encodeURIComponent(cleaned));
    } catch (encodingError) {
      // This catch block means encodeURIComponent failed, likely due to remaining
      // invalid surrogate pairs or other characters it can't handle.
      console.warn('Text encoding issue detected (encodeURIComponent failed), using cleaned text as-is after control char removal:', encodingError);
      return cleaned; // Return the text after control character removal
    }
  } catch (error) {
    console.error('Error in text sanitization:', error);
    // If sanitization itself throws an unexpected error, return original text
    return text;
  }
};

// 2. ADDED DEBUGGING FUNCTION
export const debugTextIssues = (text: string, label: string = 'Text') => {
  console.group(`🔍 Debug: ${label}`);
  console.log('Length:', text.length);
  console.log('First 100 chars:', JSON.stringify(text.substring(0, 100)));
  console.log('Contains non-ASCII:', /[^\x00-\x7F]/.test(text));
  // Check for C0 controls (excluding HT, LF, CR) and DEL.
  console.log('Contains other control chars (excl. HT,LF,CR):', /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(text));
  console.log('Character codes (first 20):', text.substring(0, 20).split('').map(c => `${c}(${c.charCodeAt(0)})`));
  console.groupEnd();
  return text; 
};

// 3. ADDED RESPONSE HANDLER FUNCTION
const handleGeminiResponse = (response: GenerateContentResponse, operation: string): string => {
  try {
    const rawText = response.text;
    
    if (!rawText) {
      console.warn(`${operation}: Empty response from Gemini API`);
      return '';
    }

    // Minimal processing: normalize line endings and trim.
    // The main sanitization will happen in sanitizeAIResponseText.
    let processedText = rawText
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Convert remaining \r to \n
      .trim();

    // Always pass through sanitizeAIResponseText for consistent, robust cleaning.
    // The function itself is designed to be conservative if major issues arise.
    return sanitizeAIResponseText(processedText);

  } catch (error) {
    console.error(`${operation}: Error processing Gemini response:`, error);
    return `Error processing response: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};


export const generateIdeasWithGemini = async (
  userQuery: string, 
  nicheName: string, 
  appSoftware: string, 
  tutorialType: string
): Promise<{ ideas: Array<{text: string, keywords: string[], aiRationale: string}>; strategicGuidance: AIStrategicGuidance | null }> => {
  if (shouldUseMockData) {
    console.warn("Gemini (generateIdeas): Using mock data due to API key issue (missing/placeholder or forced mock).");
    await new Promise(resolve => setTimeout(resolve, 500));
    const exampleNiche = nicheName || "Artificial Intelligence & Machine Learning Software and Tools";
    const exampleApp = appSoftware || (exampleNiche === "Artificial Intelligence & Machine Learning Software and Tools" ? "ChatGPT" : "Relevant Software");
    const exampleTutorialType = tutorialType || TutorialType.BEGINNER_GUIDE;
    const combinedConceptExample = userQuery || `${exampleTutorialType} for ${exampleApp} in ${exampleNiche}`;
    return {
        ideas: [
            {
                text: `Mock Idea: ${combinedConceptExample} (2024 Update)`,
                keywords: [`${exampleApp} tutorial`, `${exampleNiche} for beginners`, `how to use ${exampleApp} ${exampleTutorialType.toLowerCase()}`],
                aiRationale: `This mock idea targets a common search query for ${combinedConceptExample}. The '2024 Update' provides a fresh angle. Keywords focus on beginner intent for this tutorial type.`
            },
            {
                text: `Mock Idea: Troubleshooting ${exampleApp} during ${exampleTutorialType} - Quick Fixes for ${exampleNiche}`,
                keywords: [`${exampleApp} issues ${exampleNiche}`, `fix ${exampleApp} ${nicheName}`, `${exampleApp} troubleshooting ${exampleTutorialType.toLowerCase()}`],
                aiRationale: `Mock search indicates high interest in solving problems related to ${combinedConceptExample}. 'Quick Fixes' appeals to users looking for immediate solutions.`
            }
        ].map(idea => ({
          text: sanitizeAIResponseText(idea.text)!, 
          keywords: idea.keywords.map(k => sanitizeAIResponseText(k)!),
          aiRationale: sanitizeAIResponseText(idea.aiRationale)!
        })),
        strategicGuidance: {
            mainRecommendation: sanitizeAIResponseText(
                `STRATEGY_GUIDANCE: Mock strategy for "${userQuery || tutorialType || appSoftware || nicheName}" - Focus on practical, step-by-step content for the '${tutorialType || 'selected type'}' tutorials. (Mock insight: Search for '${appSoftware || nicheName} ${tutorialType || 'help'}' increased; video opportunity strong.)`
            )!,
            recommendedNiches: nicheName ? [] : ["Artificial Intelligence & Machine Learning Software and Tools", "Cybersecurity & Data Protection Software and Tools"],
            recommendedApps: appSoftware ? [] : [{niche: "CRM (Customer Relationship Management) Software and Tools", apps: ["Salesforce", "HubSpot CRM"]}],
            recommendedVideoTypes: tutorialType ? [tutorialType] : [TutorialType.PRACTICAL_USE_CASES, TutorialType.TROUBLESHOOTING_FIXES]
        }
    };
  }
  
  if (!ai) {
    console.error("Gemini (generateIdeas): AI SDK not initialized. Cannot make live API call. This typically means API_KEY (checked from process.env.API_KEY and fallback import.meta.env.VITE_API_KEY) is missing/placeholder or SDK failed to initialize at startup.");
    throw new Error("Gemini AI SDK is not initialized. Check API_KEY configuration and application startup logs.");
  }

  const systemInstruction = `You are the ultimate YouTube Content Strategist and SEO Master for a channel focused on software, technology, and platform tutorials. Your goal is to generate specific, actionable video titles and supporting information, heavily informed by Google Search insights.

Your primary focus MUST be guided by the user's specific inputs.

**User Input Interpretation (CRITICAL HIERARCHY):**
1.  **Primary Focus Niche (nicheName):** The main subject area (e.g., "Artificial Intelligence & Machine Learning Software and Tools").
2.  **Specific App/Software/Tool (appSoftware):** The specific tool or platform within the nicheName (e.g., "ChatGPT", "AWS S3"). This is a key focus if provided.
3.  **Tutorial Type / Content Focus (tutorialType):** The style or angle of the tutorial (e.g., "Beginner Guide", "Advanced Techniques", "Troubleshooting").
4.  **Refine AI Suggestion (userQuery):** The most granular level of detail from the user (e.g., "for marketing students", "common beginner mistakes", "integrating with Zapier"). This further specializes the (Niche + App + Tutorial Type) combination.

Synthesize these inputs to define the core topic for video ideas. If 'appSoftware' is missing, ideas should be about the 'nicheName' in general, tailored by 'tutorialType' and 'userQuery'. If 'nicheName' is missing but 'appSoftware' is present, focus on the 'appSoftware', again tailored by 'tutorialType' and 'userQuery'. If all are present, create highly specific ideas. If NO inputs are provided by the user (all are empty/AI suggested), suggest broad strategy for high-value tech tutorial areas and provide a few very general examples.

**Phase 1: Strategic Guidance (Always provide, even if brief)**
Based on the interpreted core topic (derived from user inputs and validated with Google Search), provide a concise strategic recommendation. 
Crucially, include 1-2 brief, specific examples of supporting data or search insights from Google Search that led to this recommendation.
Format as: "STRATEGY_GUIDANCE: [Your precise, actionable strategic advice. Example: 'Google Search shows rising interest in "ChatGPT for code documentation" (searches up 50% MoM), especially for Python. Current top videos are outdated. Focus on beginner-friendly, step-by-step guides for automatically generating Python docstrings using ChatGPT.']"

**Phase 2: Specific Video Ideas with Optimal Keywords & Rationale (5-7 ideas)**
For each video title (related to the core topic combination):
- The title must be compelling, directly answer a user's search intent, and incorporate optimal keywords.
- Identify 3-5 optimal, high-search-intent keywords for that specific video, validated by Google Search.
- Provide a brief rationale explaining how Google Search results indicate this topic aligns with common search queries or addresses a widespread user need for the core topic combination, and what makes this idea a good opportunity based on these search insights.

Consider (and validate with Google Search for the core topic combination):
- Specific problems, errors, or advanced use cases for the 'appSoftware' within the 'nicheName' for the 'tutorialType'.
- How the 'userQuery' (e.g., target audience, specific problem) can be addressed.
- Emerging features or less-documented aspects of the 'appSoftware'.

**Output Format (VERY STRICT):**
1.  Always start with 'STRATEGY_GUIDANCE:' on its own line.
2.  Immediately following, list each video idea on a new line.
3.  After each video idea, on a new line, list its keywords: "KEYWORDS: keyword1, keyword2, keyword3".
4.  After keywords, on a new line, provide rationale: "RATIONALE: Your rationale here."
Do NOT use numbering or bullet points for ideas/keywords/rationales. Each part on its own line. Ensure each idea generated is distinct and valuable.
`;

  let promptParts: string[] = [];
  if (nicheName && nicheName.trim()) promptParts.push(`Niche: "${nicheName.trim()}"`);
  if (appSoftware && appSoftware.trim()) promptParts.push(`App/Software: "${appSoftware.trim()}"`);
  if (tutorialType && tutorialType.trim()) promptParts.push(`Tutorial Type: "${tutorialType.trim()}"`);
  if (userQuery && userQuery.trim()) promptParts.push(`Refinement/Specifics: "${userQuery.trim()}"`);

  let focusDescription = "Generate video ideas based on the following parameters, using Google Search to inform all suggestions. Focus on topics with high search demand and clear user needs. ";
  if (promptParts.length > 0) {
    focusDescription += `User's focus: ${promptParts.join(', ')}.`;
  } else {
    focusDescription += "User has not provided specific inputs; provide broad strategic advice based on high-value software/tech tutorial areas (e.g., AI, Cloud, Cybersecurity, popular SaaS) and then generate example video ideas for those general areas.";
  }
  
  const fullPrompt = `${focusDescription}\n\nAdhere strictly to the Output Format: STRATEGY_GUIDANCE, then Idea, then KEYWORDS, then RATIONALE, each on a new line.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }], 
            temperature: 0.7, 
            topP: 0.9,
            topK: 50,
        }
    });
    
    const text = handleGeminiResponse(response, 'Idea Generation');
    
    if (!text) {
      console.warn("Gemini API returned empty text response for idea generation.");
      return { ideas: [], strategicGuidance: null };
    }
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let strategicGuidanceString = '';
    const generatedIdeas: Array<{text: string, keywords: string[], aiRationale: string}> = [];

    if (lines.length > 0 && lines[0].startsWith('STRATEGY_GUIDANCE:')) {
        strategicGuidanceString = lines.shift()?.replace('STRATEGY_GUIDANCE:', '').trim() || '';
    }
    
    for (let i = 0; i < lines.length; i++) {
        const ideaText = lines[i];
        let keywords: string[] = [];
        let rationale = 'AI did not provide a specific rationale.';

        if (lines[i+1]?.startsWith('KEYWORDS:')) {
            keywords = lines[i+1].replace('KEYWORDS:', '').split(',').map(k => k.trim()).filter(k => k);
            i++; 
        }
        if (lines[i+1]?.startsWith('RATIONALE:')) {
            rationale = lines[i+1].replace('RATIONALE:', '').trim();
            i++; 
        }
        if (ideaText && !ideaText.startsWith("KEYWORDS:") && !ideaText.startsWith("RATIONALE:") && !ideaText.startsWith("STRATEGY_GUIDANCE:")) {
             generatedIdeas.push({ text: ideaText, keywords, aiRationale: rationale });
        }
    }
    
    const strategicGuidance: AIStrategicGuidance | null = strategicGuidanceString ? { mainRecommendation: strategicGuidanceString } : null;

    return { ideas: generatedIdeas, strategicGuidance };

  } catch (error) {
    console.error('Error calling Gemini API for idea generation (with Google Search):', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating ideas with Gemini.');
  }
};

export const generateVideoScriptAndInstructions = async (
  ideaTitle: string,
  niche: string,
  appSoftware: string,
  targetLengthMinutes: number,
  existingKeywords?: string[],
  competitorInsights?: string // This is the AI Strategic Angle
): Promise<{ script: string; videoInstructions: string; suggestedResources: string[] }> => {
  if (shouldUseMockData) {
    console.warn("Gemini (generateVideoScriptAndInstructions): Using mock data due to API key issue.");
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockCompetitorInsight = competitorInsights || "Mock: No specific competitor insights provided, focus on generic good practices.";
    const mockScriptBody = `
Introduction and Hook
In today's video, I'm going to teach you how to ${ideaTitle.toLowerCase()} using ${appSoftware || 'the best tools'} for the ${niche} niche! This is super useful for [mention a common benefit, informed by: ${mockCompetitorInsight.substring(0, 50)}...]. Let's dive in!

Setting Up Your Workspace
First, you'll need to open ${appSoftware || 'the application'}. Make sure you check the project settings are correct. This is crucial for good results. 
Then, ensure your project settings are correct.

Executing the Core Task
Next, navigate to the 'Settings' menu. You'll see an option for a specific UI element.
Follow this by selecting the 'Advanced' tab.
Now, perform the main action: click 'Process Data'. This might take a moment.
Quick pause! If you're finding this tutorial helpful, hit that like button and subscribe for more content like this. It really helps the channel!

Reviewing and Refining
Once that's done, check the output. You should see the expected result.
If not, double-check your input from Step 1.

Conclusion
And there you have it! That's how you can easily ${ideaTitle.toLowerCase()}. If you have questions, drop them in the comments. Thanks for watching, and I'll see you next time!
`;
    const mockProductionInstructions = `
- For OBS: Use a clean desktop background. Ensure ${appSoftware || 'the application'} window is clearly visible.
- Zoom in on important UI elements or menu clicks for each major step.
- Use on-screen text annotations for key commands, shortcuts, or to emphasize unique points from competitor insights.
- Maintain an enthusiastic but clear vocal pace. Sections should feel distinct but flow well.
- Edit out long pauses or mistakes.
- Ensure each section (e.g., "Setting Up Your Workspace", "Executing the Core Task") is visually distinct if possible.
`;
    const mockResources = `
- https://mockresource.com/docs/${appSoftware ? appSoftware.toLowerCase().replace(/\s/g, '-') : 'general-topic'}
- https://anothermock.com/tutorials/${niche.toLowerCase().replace(/\s/g, '-')}-guide
`;

    return {
        script: sanitizeAIResponseText(mockScriptBody)!,
        videoInstructions: sanitizeAIResponseText(mockProductionInstructions)!,
        suggestedResources: (mockResources.split('\n').map(r => r.replace(/^- /, '').trim()).filter(r => r.startsWith("http")) || ["https://mockresource.com/error"])
                            .map(r => sanitizeAIResponseText(r)!)
    };
  }

  if (!ai) {
    console.error("Gemini (generateVideoScriptAndInstructions): AI SDK not initialized.");
    throw new Error("Gemini AI SDK is not initialized. Check API_KEY configuration.");
  }

  const systemInstruction = `You are an expert YouTube scriptwriter specializing in clear, actionable OBS Studio style tutorial scripts. Maintain a direct, instructional, and enthusiastic tone. Get straight to the point.

**CRITICAL SCRIPT FORMATTING RULES FOR PART 1 (Video Script):**
1.  **Clean Script Only:** The script body in Part 1 must contain ONLY the words to be spoken. ABSOLUTELY NO instructional text, director's notes, or explanations in brackets (e.g., "[Show screen]", "[Emphasize this point]", "[Sound effect]").
2.  **Plain Text Section Titles:** Script sections within Part 1 must be introduced by their title on a new line (e.g., "Introduction and Hook"). NO Markdown symbols (like '##') or any other special characters should precede these titles. The titles themselves should be plain text.
3.  **Substantial Sections:** Sections should represent logical shifts or major steps in the tutorial. Aim for sections that are roughly 30 seconds to 1.5 minutes of spoken content each, not just single short paragraphs. Ensure natural flow. These titles are for YouTube chapters and script organization.

All non-spoken instructions (camera work, on-screen text, tone, delivery advice) MUST be in "Part 2: Video Production Instructions".
The three main part headers (Part 1, Part 2, Part 3) are essential for parsing and MUST be exactly as specified.`;

  let prompt = `
Video Title/Idea: "${ideaTitle}"
Niche: "${niche}"
App/Software Focus: ${appSoftware ? `"${appSoftware}"` : "Not specified, focus on general niche topic"}
Target Video Length: Approximately ${targetLengthMinutes} minutes.
${existingKeywords && existingKeywords.length > 0 ? `Relevant Keywords to Incorporate (subtly in script): ${existingKeywords.join(', ')}\n` : ''}
${competitorInsights ? `CRITICAL Competitor Insights & Strategic Angle (MUST HEAVILY INFLUENCE SCRIPT TO BE UNIQUE AND SUPERIOR): ${competitorInsights}\n` : "No specific competitor data provided; focus on creating a strong foundational script based on the title and niche, ensuring clarity and value.\n"}

**Mandatory Output Structure & Content (Strictly Follow - All three parts are required):**

**Part 1: Video Script**
(This part contains ONLY the spoken script. Section titles are plain text on their own line. No bracketed instructions. No markdown for titles.)

Introduction and Hook
(Script for intro and hook. Approx 10-15% of total time. Start IMMEDIATELY: "In today's video, I'm going to teach/show you how to [Core Task from Video Title]." Briefly (1-2 sentences) explain the value/benefit, hinting at the unique angle from Competitor Insights.)

[Example Section Title for Setup]
(Script content for this segment. This could be multiple paragraphs detailing setup steps. Clearly state actions, provide brief context. Ensure content directly addresses gaps/opportunities from Competitor Insights.)

[Example Section Title for Core Task]
(Script content for core task. Break down the process into clear, substantial steps. Each major step or phase should be its own segment, introduced with a plain text title. If script is for >3 minutes, include a mid-roll engagement prompt like "Quick pause! If you're finding this helpful, hit like and subscribe..." within a relevant segment.)

[Example Section Title for Tips/Troubleshooting]
(Optional segment. Briefly mention 1-2 common pitfalls or useful tips, especially if Competitor Insights suggest this is a weak area.)

Conclusion and Call to Action
(Script for conclusion. Approx 10-15% of total time. Quick recap. Encourage engagement. Sign off.)

**Part 2: Video Production Instructions**
(All non-spoken instructions go here. Practical tips for OBS screen recording for THIS SPECIFIC SCRIPT, emphasizing visual support for each segment and the unique angle: e.g., "Clearly show how this approach differs from what competitor X does.", "Use on-screen text to highlight key differentiators or benefits derived from the strategic angle.")

**Part 3: Suggested Script Resources**
(If Google Search identifies relevant documentation, tools, or assets, list their URIs here. If not, state "No specific external resources identified by search for this topic." This part must always be included.)

**CRITICAL REMINDERS - Format Adherence is Key for Application Parsing:**
*   **Part 1: Video Script MUST BE CLEAN** - Only spoken words. No bracketed instructions. Plain text section titles.
*   Pace the script for the **Target Video Length**. Sections must be substantial and logical.
*   Use Google Search to inform content and validate the strategic angle.
*   The competitor insights MUST be used to make the script unique and valuable.
*   The three main part headers (**Part 1: Video Script**, **Part 2: Video Production Instructions**, **Part 3: Suggested Script Resources**) must be present and formatted exactly as shown, with bolding and colons.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.65, 
        topP: 0.9,
        topK: 45,
      },
    });

    const rawFullText = handleGeminiResponse(response, 'Script Generation');

    if (!rawFullText) {
      console.warn("Gemini API returned empty text response for script generation.");
      return { script: "Error: Empty response from AI.", videoInstructions: "", suggestedResources: [] };
    }
    
    const scriptMatch = rawFullText.match(/\*\*Part 1: Video Script\*\*\s*([\s\S]*?)(?=\*\*Part 2: Video Production Instructions\*\*|$)/i);
    const instructionsMatch = rawFullText.match(/\*\*Part 2: Video Production Instructions\*\*\s*([\s\S]*?)(?=\*\*Part 3: Suggested Script Resources\*\*|$)/i);
    const resourcesMatch = rawFullText.match(/\*\*Part 3: Suggested Script Resources\*\*\s*([\s\S]*)/i);

    const scriptContent = scriptMatch?.[1]?.trim() ?? "AI failed to generate script content in the expected format.";
    const instructionsContent = instructionsMatch?.[1]?.trim() ?? "AI failed to generate production instructions in the expected format.";
    let resourcesContentRaw = resourcesMatch?.[1]?.trim() ?? "No specific external resources identified by search for this topic.";
    
    let suggestedResourceList: string[] = [];
    if (resourcesContentRaw && !resourcesContentRaw.toLowerCase().includes("no specific external resources")) {
        suggestedResourceList = resourcesContentRaw.split('\n')
            .map(line => line.replace(/^- /, '').trim())
            .filter(line => line.startsWith("http://") || line.startsWith("https://"));
    }


    return {
      script: sanitizeAIResponseText(scriptContent), 
      videoInstructions: sanitizeAIResponseText(instructionsContent),
      suggestedResources: suggestedResourceList.map(r => sanitizeAIResponseText(r)),
    };

  } catch (error) {
    console.error('Error calling Gemini API for script generation:', error);
    const message = error instanceof Error ? error.message : 'Unknown error.';
    return {
      script: `Error generating script: ${message}`,
      videoInstructions: "Could not generate production instructions due to an error.",
      suggestedResources: [],
    };
  }
};


export const expandIdeaIntoRelatedIdeas = async (
  ideaText: string,
  niche: string,
  appSoftware: string
): Promise<Array<{text: string, keywords: string[]}>> => { 
  if (shouldUseMockData) {
      console.warn("Gemini (expandIdea): Using mock data due to API key issue.");
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
          {
            text: `[MOCK] Advanced Techniques for: "${ideaText.substring(0,30)}..." using ${appSoftware || 'related tools'} in ${niche}. Focus: Hyper-specific example 1.`,
            keywords: [`advanced ${appSoftware || niche}`, `${ideaText.substring(0,10)} expert tricks`, `${niche} pro guide`]
          },
          {
            text: `[MOCK] Troubleshooting rare error XYZ with ${appSoftware || 'this topic'} for "${ideaText.substring(0,20)}..." for niche users.`,
            keywords: [`${appSoftware || niche} specific error XYZ`, `fix ${ideaText.substring(0,10)} rare problem`, `${niche} specific troubleshooting`]
          },
           {
            text: `[MOCK] How to use ${appSoftware || 'this tool'} to achieve [Hyper-Specific Task, e.g., 'automate window washing schedules'] within the ${niche} context.`,
            keywords: [`${appSoftware || niche} for window washing`, `automate specific task ${niche}`, `unusual uses of ${appSoftware}`]
          }
      ].map(idea => ({ // Sanitize mock data
          text: sanitizeAIResponseText(idea.text)!,
          keywords: idea.keywords.map(k => sanitizeAIResponseText(k)!)
      }));
  }

  if (!ai) {
    console.error("Gemini (expandIdeaIntoRelatedIdeas): AI SDK not initialized. Cannot make live API call.");
    throw new Error("Gemini AI SDK is not initialized. Check API_KEY configuration.");
  }
  
  const prompt = `As a YouTube content strategist and keyword specialist, you've just created a video titled "${ideaText}" for the '${niche}' niche${appSoftware ? `, focusing on '${appSoftware}'` : ''}.
The goal is to generate **5-7 hyper-specific, granular "niche-of-the-niche" follow-up video ideas**. These ideas should drill down into very specific sub-topics, user problems, or unique applications that are distinct enough for their own standalone videos and target long-tail search queries.

Consider the following angles for generating hyper-specific ideas:
-   **Ultra-Specific Problem Solving:** Focus on a *single, very specific problem* users might encounter related to "${ideaText}" or when using "${appSoftware}" for a task in the "${niche}" context. (e.g., If idea is "How to use ChatGPT for marketing," a hyper-specific idea might be "Fix 'ChatGPT Too Vague for Product Descriptions' Error with This Prompt Structure").
-   **Niche Down the Application:** Take "${ideaText}" and apply it to an extremely specific scenario or sub-audience within the broader "${niche}". (e.g., If idea is "Learn Photoshop Basics," a hyper-specific idea might be "Photoshop for Miniature Painters: Cleaning Up Scanned Textures for Bases").
-   **Unique Use Cases/Combinations:** Explore less obvious or unconventional applications of "${appSoftware}" or the concepts in "${ideaText}" within the "${niche}". (e.g., If idea is "Good Prompts for AI Art," a hyper-specific idea might be "AI Art Prompts for Generating historically accurate medieval food items").
-   **Step-by-Step for One Micro-Feature:** If "${ideaText}" is a general tutorial, pick one tiny feature or sub-step and create a whole video around mastering just that.

For each new hyper-specific idea, also provide 3-5 **optimal, evergreen keywords** relevant to that specific sub-topic.

Return ONLY a list of video titles, each on a new line. After each video idea, on a new line, list its optimal keywords, comma-separated and prefixed with "KEYWORDS:". No numbering, no intro/outro.
Example:
Original Idea: How to Use Excel Pivot Tables
Hyper-Specific Expanded Idea:
Fix Excel Pivot Table 'Data Source Not Valid' Error with Mixed Data Types
KEYWORDS: Excel pivot table error, fix pivot table data source, mixed data types Excel, Excel troubleshooting
---
Hyper-Specific Expanded Idea:
Creating Dynamic Excel Pivot Table Reports for Monthly Sales Tracking in Small Retail
KEYWORDS: dynamic pivot tables, Excel sales report, monthly sales tracking, Excel for retail, small business Excel
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { temperature: 0.8, topP: 0.95, topK: 50 }
    });

    const text = handleGeminiResponse(response, 'Idea Expansion');

    if (!text) {
        console.warn("Gemini API returned empty text response for idea expansion.");
        return [];
    }
    
    const expandedIdeasWithKeywords: Array<{text: string, keywords: string[]}> = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    for (let i = 0; i < lines.length; i++) {
        const currentLine = lines[i];
        if (currentLine.startsWith("KEYWORDS:") || currentLine === "---") continue; 

        const ideaTitle = currentLine;
        let keywords: string[] = [];
        if (lines[i+1]?.startsWith('KEYWORDS:')) {
            keywords = lines[i+1].replace('KEYWORDS:', '').split(',').map(k => k.trim()).filter(k => k);
            i++; 
        }
        if (ideaTitle.length > 10 && ideaTitle.length < 200) { 
            expandedIdeasWithKeywords.push({ text: sanitizeAIResponseText(ideaTitle), keywords: keywords.map(k => sanitizeAIResponseText(k)) });
        }
    }
    return expandedIdeasWithKeywords;

  } catch (error) {
    console.error('Error calling Gemini API for idea expansion:', error);
    if (error instanceof Error) {
        throw new Error(`Gemini API error (expand ideas): ${error.message}`);
    }
    throw new Error('An unknown error occurred while expanding ideas with Gemini.');
  }
};

export const generateKeywordsWithGemini = async (
  ideaText: string,
  niche: string,
  appSoftware: string
): Promise<{ keywords: string[]; groundingChunks: GroundingChunk[] | undefined }> => {
  if (shouldUseMockData) {
    console.warn("Gemini (generateKeywords): Using mock data due to API key issue.");
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      keywords: [
        `mock keyword ${appSoftware || niche}`,
        `mock ${niche} tutorial ${appSoftware || ''}`,
        `how to ${ideaText.substring(0,15)} ${appSoftware || ''}`,
        `${appSoftware || niche} tips`,
        `best ${niche} ${appSoftware || 'guide'}`,
      ].map(k => sanitizeAIResponseText(k)!), 
      groundingChunks: [
        { web: { uri: "https://mock-source-1.com", title: "Mock Source for Keywords 1" } },
        { web: { uri: "https://mock-source-2.com/article", title: "Another Mock Keyword Article" } },
      ]
    };
  }

  if (!ai) {
    console.error("Gemini (generateKeywordsWithGemini): AI SDK not initialized. Cannot make live API call.");
    throw new Error("Gemini AI SDK is not initialized. Check API_KEY configuration.");
  }

  const prompt = `You are a YouTube SEO and keyword research expert.
For a video idea titled: "${ideaText}"
Niche: "${niche}"
${appSoftware ? `App/Software in focus: "${appSoftware}"\n` : 'No specific app/software is the focus, consider general niche terms.\n'}
Use Google Search to analyze top-ranking content, common search queries, and related terms for this specific video topic.
Based on your search findings, identify and suggest 5-7 highly relevant SEO keywords or keyphrases that demonstrate clear user search intent and are likely to have decent search volume.
Focus on terms that users are *actually typing* when looking for a solution or "how-to" guide related to the video idea.
Include a mix of:
1.  Core terms directly from the title/niche/${appSoftware ? 'app' : 'general topic'}.
2.  Long-tail keywords representing specific problems, questions, or use-cases (e.g., "how to fix [specific error] in ${appSoftware || '[relevant tool/area]'} for [specific purpose/audience]").
3.  Keywords indicating user intent (e.g., "tutorial," "guide," "troubleshooting," "for beginners," "advanced," "alternative," "vs").
4.  Consider question-based keywords if relevant ("what is X", "how does X work").

Return ONLY the list of keywords/keyphrases, each on a new line.
Do not use numbering, bullet points, or any introductory/concluding remarks.
Example for a video on "Excel Budget Template":
Excel budget template tutorial
how to create budget in Excel
personal finance Excel spreadsheet
Excel for budgeting beginners
free Excel budget planner
what is the best way to make a budget in excel
excel budget template for students
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
      },
    });

    const text = handleGeminiResponse(response, 'Keyword Generation');
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

    if (!text) {
      console.warn("Gemini API returned empty text response for keyword generation.");
      return { keywords: [], groundingChunks };
    }

    const generatedKeywords = text
      .split('\n')
      .map(line => sanitizeAIResponseText(line.trim().replace(/^(- |\* |\d+\. )/, '').trim())) // Ensure each line is sanitized
      .filter(line => line.length > 2 && line.length < 100); 

    return { keywords: generatedKeywords, groundingChunks };

  } catch (error) {
    console.error('Error calling Gemini API for keyword generation:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error (keywords): ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating keywords with Gemini.');
  }
};

export const generateTitleSuggestionsWithGemini = async (
  originalTitle: string,
  niche: string,
  appSoftware: string,
  keywords?: string[]
): Promise<TitleSuggestion[]> => {
  if (shouldUseMockData) {
    console.warn("Gemini (generateTitleSuggestions): Using mock data due to API key issue.");
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        suggestedTitle: sanitizeAIResponseText(`[MOCK] REVEALED: The Secret to Using ${appSoftware || 'Topic'} for ${niche}!`)!,
        rationale: sanitizeAIResponseText("Uses a stronger hook ('REVEALED', 'Secret') and directly mentions the benefit.")!
      },
      {
        suggestedTitle: sanitizeAIResponseText(`[MOCK] ${appSoftware || 'Topic'} ${niche} Tutorial: Ultimate Guide 2024`)!,
        rationale: sanitizeAIResponseText("More SEO-friendly, includes 'Tutorial', 'Ultimate Guide', and current year.")!
      }
    ];
  }

  if (!ai) {
    console.error("Gemini (generateTitleSuggestionsWithGemini): AI SDK not initialized. Cannot make live API call.");
    throw new Error("Gemini AI SDK is not initialized. Check API_KEY configuration.");
  }

  const systemInstruction = `You are an expert YouTube video title strategist and SEO copywriter.
Your goal is to analyze a given video title and suggest 2-3 optimized alternatives, explaining your reasoning.
Focus on maximizing Click-Through Rate (CTR), improving SEO, and ensuring clarity. Aim for titles that sound compelling and hint at unique value or an "untapped pocket" if the original idea and keywords suggest such an angle.
Use Google Search grounding to understand what phrases have search volume and how existing content is titled.`;

  const userPrompt = `Video Idea Details:
- Original Title: "${originalTitle}"
- Niche: "${niche}"
${appSoftware ? `- App/Software Focus: "${appSoftware}"\n` : ''}
${keywords && keywords.length > 0 ? `- Relevant Keywords to Consider for SEO & Untapped Angles: ${keywords.join(', ')}\n` : ''}

Task:
1.  Analyze the "Original Title."
2.  Suggest 2-3 alternative titles. Each suggestion should aim to be highly compelling and optimized. 
    *   If keywords suggest an "untapped pocket" (e.g., specific problem + solution with less competition), craft titles that exploit this unique angle.
    *   Titles should incorporate strong keywords that people are actually searching for (validated by your Google Search tool).
    *   Prioritize clarity, strong hooks (curiosity, benefit, urgency), and SEO-friendliness.
3.  For each suggested title, provide a brief, clear rationale (1-2 sentences) explaining *why* it's a good alternative. The rationale should explain how it targets an "untapped pocket" if applicable, or how it improves CTR/SEO based on search insights.

Output Format:
Provide exactly 2 or 3 suggestions. Each suggestion MUST follow this strict format, with "---" (three hyphens) as a separator between suggestions:
SUGGESTION: [Your New Title Suggestion Here]
RATIONALE: [Your Rationale Here]
---
SUGGESTION: [Another New Title Suggestion Here]
RATIONALE: [Rationale for the other title]

Example for "untapped pocket" rationale:
SUGGESTION: FIX Git 'Unrelated Histories' FAST (Beginner-Friendly 2024)
RATIONALE: Targets a specific error ("Unrelated Histories") with strong user intent ("FIX," "FAST"). "Beginner-Friendly 2024" addresses a potential "untapped pocket" if existing solutions are complex or outdated, as confirmed by Google Search showing few recent, simple guides for this specific error.

Do NOT include any other text, preamble, or concluding remarks outside of this structured format. The response must start directly with "SUGGESTION:".`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], 
        temperature: 0.72, 
        topP: 0.9,
        topK: 50,
      }
    });

    const text = handleGeminiResponse(response, 'Title Suggestions');

    if (!text) {
      console.warn("Gemini API returned empty text response for title suggestions.");
      return [];
    }

    const suggestions: TitleSuggestion[] = [];
    const parts = text.split('---').map(p => p.trim()).filter(p => p.length > 0);

    for (const part of parts) {
      const suggestionMatch = part.match(/SUGGESTION:\s*([\s\S]*?)\s*RATIONALE:\s*([\s\S]*)/);
      if (suggestionMatch && suggestionMatch[1] && suggestionMatch[2]) {
        suggestions.push({
          suggestedTitle: sanitizeAIResponseText(suggestionMatch[1].trim()),
          rationale: sanitizeAIResponseText(suggestionMatch[2].trim()),      
        });
      } else {
         console.warn("Could not parse title suggestion part:", part);
      }
    }
    return suggestions;

  } catch (error) {
    console.error('Error calling Gemini API for title suggestions:', error);
    if (error instanceof Error) {
      throw new Error(`Gemini API error (title suggestions): ${error.message}`);
    }
    throw new Error('An unknown error occurred while generating title suggestions with Gemini.');
  }
};

export const analyzeYouTubeCompetitorsForAngles = async (
    ideaText: string,
    competitorVideos: YouTubeVideoResult[] 
): Promise<string> => {
    if (shouldUseMockData) {
        console.warn("Gemini (analyzeYouTubeCompetitorsForAngles): Using mock data due to API key issue.");
        await new Promise(resolve => setTimeout(resolve, 400));
        if (competitorVideos.length === 0) return sanitizeAIResponseText("AI STRATEGIC ANGLE:\nOverall Assessment: Mock: No competitor videos found. This topic seems wide open! Average video length N/A.\nActionable Angles:\n*   Focus on a comprehensive beginner's guide, clearly dated for the current year (e.g., 2024).\n*   Highlight unique benefits or ease of use if applicable to the idea.\n*   Create a visually appealing thumbnail that stands out.")!;
        
        const mockComp = competitorVideos[0];
        
        const totalSecondsArray = competitorVideos
          .map(v => parseISO8601Duration(v.duration).totalSeconds)
          .filter(s => s > 0); // Filter out N/A or 0 second durations for average calculation

        const sumOfSeconds = totalSecondsArray.reduce((acc, curr) => acc + curr, 0);
        const avgMockLengthInSeconds = totalSecondsArray.length > 0 ? sumOfSeconds / totalSecondsArray.length : 0;
        
        let avgLengthFormatted = 'varied or N/A';
        if (avgMockLengthInSeconds > 0) {
            const avgMinutes = Math.floor(avgMockLengthInSeconds / 60);
            const avgSeconds = Math.round(avgMockLengthInSeconds % 60);
            avgLengthFormatted = `${avgMinutes}m ${avgSeconds}s`;
        }
        

        return sanitizeAIResponseText(`AI STRATEGIC ANGLE:\nOverall Assessment: Mock: Given competitors like "${mockComp.title}" (Views: ${mockComp.viewCountText}, Age: ${mockComp.publishedAtText}, Channel Subs: ${mockComp.channelSubscriberCountText}), there's some existing content. Average competitor video length is around ${avgLengthFormatted}.\nActionable Angles:\n*   Consider an up-to-date (e.g., 2024) version for "${ideaText}" if competitor content is older.\n*   Explore a unique practical example or a niche application not covered by others.\n*   If competitors have low subscriber counts but high views on similar topics, it indicates strong demand; focus on higher quality production or clearer explanations.`)!;
    }
    
    if (!ai) {
      console.error("Gemini (analyzeYouTubeCompetitorsForAngles): AI SDK not initialized. Cannot make live API call.");
      return sanitizeAIResponseText('AI STRATEGIC ANGLE:\nOverall Assessment: Gemini API Key (checked from process.env.API_KEY and fallback import.meta.env.VITE_API_KEY) not configured or SDK failed to initialize. Cannot analyze competitors.\nActionable Angles:\n*   Manually review competitor videos for gaps and opportunities.')!;
    }

    const competitorInfo = competitorVideos
      .map(vid => `- Title: "${vid.title}"\n  Duration: ${vid.duration || 'N/A'}\n  Type: ${vid.videoType || 'N/A'}\n  Views: ${vid.viewCountText}\n  Age: ${vid.publishedAtText}\n  Channel Subscribers: ${vid.channelSubscriberCountText || 'N/A'}\n  Description Snippet: "${vid.descriptionSnippet || 'N/A'}"`)
      .slice(0, 7) // Limit to first 7 for prompt length
      .join('\n---\n');

    const prompt = `You are an expert YouTube Content Strategist.
Your task is to analyze the provided competitor video data for the target video idea: "${ideaText}".

Competitor Videos Data (includes Title, Duration, Type (Video/Short), Views, Age, Subscribers, Description Snippet):
${competitorInfo.length > 0 ? competitorInfo : "No competitor videos found in the top search results."}

Based on this data, provide:
1.  **Overall Assessment (1-2 concise sentences):** Briefly summarize the competitive landscape.
    *   Is it crowded, sparse, or dominated by old content? Are there many Shorts or longer videos?
    *   **CRITICAL: What is the general trend for video lengths (e.g., "mostly short around 1-2 mins", "mostly long-form around 10-15 mins", "highly varied from Shorts to 20+ mins")? Provide an estimated average or clear range if discernible from the provided Durations.**
    *   Are there videos from channels with relatively low subscriber counts getting high views (this indicates strong organic topic demand)?
    *   Critically, if keywords like "untapped," "secrets," "hidden," or similar appear in the original idea text ("${ideaText}"), assess if the competitor data truly reflects a gap related to these "untapped" aspects.

2.  **Actionable Strategic Angles (2-3 distinct bullet points):** Suggest specific, actionable angles or improvements a new video on "${ideaText}" could focus on to differentiate itself and offer more value. For each angle, be specific and explain *why* it's a good strategy based on the competitor data (or lack thereof), including any insights on video length.
    *   **Content Gaps/Depth/Format/Length:** If competitors miss key aspects, only cover them superficially, or if a different format/length (e.g., a Short for a quick tip vs. long-form for deep dive, or a longer video if current ones are too brief, or shorter if current are too long and rambling) would be better. Use the video length assessment from above to inform this.
    *   **Freshness/Updates:** If existing videos are old (e.g., >1-2 years), emphasize creating an up-to-date version.
    *   **Unique Value Proposition:** How can the new video be clearer, more engaging, solve a specific problem better, or offer a unique perspective?
    *   **Niche Down/Audience Focus:** Could targeting a specific sub-audience or use-case be beneficial?
    *   **Leverage View/Subscriber Discrepancies:** If videos from channels with few subscribers have high views, this signals strong topic interest and potentially lower quality competition.
    *   **Title/Thumbnail Strategy Hint:** Briefly suggest how the title/thumbnail could reflect the unique angle.

Output Format:
Start with "AI STRATEGIC ANGLE:" (all caps).
Then, on a new line, "Overall Assessment:" followed by your assessment (MUST include video length observations).
Then, on a new line, "Actionable Angles:" followed by bulleted suggestions (using '*' for bullets).

Example:
AI STRATEGIC ANGLE:
Overall Assessment: The topic has several videos, mostly 8-12 minutes long, but many are over two years old and focus on broad overviews. One video from a channel with only 5K subscribers has 100K views, indicating high interest in practical application. No Shorts seen.
Actionable Angles:
*   Develop a comprehensive, up-to-date ([Current Year]) tutorial (perhaps aiming for 10-15 mins to match typical length but with better depth) focusing on practical application with a real-world project example.
*   Consider creating a 30-60 second YouTube Short summarizing the #1 key takeaway from "${ideaText}" as existing content is all long-form.
*   Target beginners specifically if current videos assume too much prior knowledge. Title could be: "${ideaText} - The ULTIMATE Beginner's Guide ([Current Year])".
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: prompt,
            config: { temperature: 0.68, topP: 0.92, topK: 45 }
        });
        
        const text = handleGeminiResponse(response, 'Competitor Analysis');

        if (!text) {
          return sanitizeAIResponseText('AI STRATEGIC ANGLE:\nOverall Assessment: AI analysis did not return a specific insight.\nActionable Angles:\n*   Consider general best practices: up-to-date content, clear explanations, and unique examples.')!;
        }
        const prefixedText = text.trim().startsWith("AI STRATEGIC ANGLE:") ? text.trim() : `AI STRATEGIC ANGLE:\n${text.trim()}`;
        return sanitizeAIResponseText(prefixedText)!;

    } catch (error) {
        console.error('Error calling Gemini API for competitor analysis:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during AI analysis.';
        return sanitizeAIResponseText(`AI STRATEGIC ANGLE:\nOverall Assessment: Error during analysis - ${errorMessage}\nActionable Angles:\n*   Review competitor videos manually to identify gaps.`)!;
    }
};