
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GroundingChunk, TitleSuggestion, AIStrategicGuidance, YouTubeVideoResult, HighRpmNicheCategory, NEW_HIGH_RPM_CATEGORIES } from '../types'; // Added NEW_HIGH_RPM_CATEGORIES

// Use import.meta.env for Vite environment variables
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY || API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || API_KEY === "MISSING_API_KEY_WILL_FAIL") { 
  console.warn("Gemini Service: VITE_API_KEY for Gemini is missing or a placeholder. AI features will use mock data or fail. Ensure VITE_API_KEY is set in Vercel Environment Variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY_WILL_FAIL" }); 
const modelName = 'gemini-2.5-flash-preview-04-17'; 

const shouldUseMockData = !API_KEY || API_KEY === "MISSING_API_KEY_WILL_FAIL" || API_KEY === "YOUR_ACTUAL_GEMINI_API_KEY_HERE";

// Helper to remove common non-printable characters except standard whitespace
const sanitizeAIResponseText = (text: string | undefined): string => {
    if (!text) return '';
    // Allow printable ASCII (U+0020 to U+007E), 
    // Latin-1 Supplement (U+00A0 to U+00FF for common accented characters),
    // and specific whitespace characters: space (already in U+0020), tab, newline, carriage return.
    return text.replace(/[^\u0020-\u007E\u00A0-\u00FF\t\n\r]/g, '');
};


export const generateIdeasWithGemini = async (
  userQuery: string, 
  nicheName: string, // Renamed from 'niche' to 'nicheName' for clarity
  appSoftware: string, 
  // Pass the full NEW_HIGH_RPM_CATEGORIES for context, Gemini can summarize or use parts of it.
  // No longer just allKnownNicheLabels. The prompt will guide Gemini on how to use this.
  highRpmNicheContext: HighRpmNicheCategory[] 
): Promise<{ ideas: Array<{text: string, keywords: string[], aiRationale: string}>; strategicGuidance: AIStrategicGuidance | null }> => {
  if (shouldUseMockData) {
    console.warn("Gemini (generateIdeas): Missing/placeholder VITE_API_KEY. Returning mock data.");
    await new Promise(resolve => setTimeout(resolve, 500));
    const exampleNiche = nicheName || "Personal Finance"; // Use nicheName
    const exampleApp = appSoftware || (exampleNiche === "Personal Finance" ? "Budgeting Apps" : "Relevant Software");
    const combinedConceptExample = userQuery || `Beginner's Guide to ${exampleApp} in ${exampleNiche}`;
    return {
        ideas: [
            {
                text: `Mock Idea: ${combinedConceptExample} (2024 Update)`,
                keywords: [`${exampleApp} tutorial`, `${exampleNiche} for beginners`, `how to use ${exampleApp}`],
                aiRationale: `This mock idea targets a common search query for ${combinedConceptExample}. The '2024 Update' provides a fresh angle. Keywords focus on beginner intent.`
            },
            {
                text: `Mock Idea: Troubleshooting ${exampleApp} for ${exampleNiche} - Quick Fixes`,
                keywords: [`${exampleApp} issues ${exampleNiche}`, `fix ${exampleApp} ${nicheName}`, `${exampleApp} troubleshooting`],
                aiRationale: `Mock search indicates high interest in solving problems related to ${combinedConceptExample}. 'Quick Fixes' appeals to users looking for immediate solutions.`
            }
        ],
        strategicGuidance: {
            mainRecommendation: nicheName || appSoftware || userQuery ? 
                sanitizeAIResponseText(`STRATEGY_GUIDANCE: Mock strategy for "${userQuery || nicheName || appSoftware}" - Focus on practical, step-by-step problem-solving content. (Mock insight: Search for '${userQuery || appSoftware || nicheName} help' increased 20% last quarter; top content is text-based, indicating video opportunity.)`) : 
                sanitizeAIResponseText("STRATEGY_GUIDANCE: Mock search suggests focusing on tutorials within 'Core Finance & Wealth Management' like 'Online Banking App Tutorials' or 'Personal Investing Platform Tutorials', as these often have high RPMs and consistent demand. (Mock Insight: 'How to use [Popular Banking App]' searches remain stable; user need evergreen content). Ensure content is up-to-date for the current year."),
            recommendedNiches: nicheName ? [] : ["AI Tools for Business", "Accounting & Bookkeeping Software Tutorials"],
            recommendedApps: appSoftware ? [] : [{niche: "CRM Software", apps: ["Salesforce", "HubSpot CRM"]}],
            recommendedVideoTypes: ["Step-by-step Guides", "Troubleshooting Tutorials"]
        }
    };
  }
  
  // Prepare context of high RPM niches for the AI
  let highRpmNicheSummaryForPrompt = "Consider these general high-value, high-RPM niche categories and example topics if providing broad strategic guidance:\n";
  highRpmNicheContext.slice(0, 5).forEach(category => { // Limit to first 5 categories for brevity
    highRpmNicheSummaryForPrompt += `- Category: ${category.categoryName}\n`;
    category.niches.slice(0, 2).forEach(nicheDetail => { // Limit to first 2 niches per category
        highRpmNicheSummaryForPrompt += `  - Example Niche Topic: ${nicheDetail.name} (e.g., for ${nicheDetail.examples.slice(0,2).join('/')})\n`;
    });
  });


  const systemInstruction = `You are the ultimate YouTube Content Strategist and SEO Master. Your goal is to proactively identify HIGH-RPM, EVERGREEN, PERENNIAL video opportunities and generate specific, actionable video titles for a YouTube channel focused on how-to and tutorial content. You MUST use Google Search to inform ALL your suggestions.

**High-RPM Niche Context (For Your Awareness):**
${highRpmNicheSummaryForPrompt}
While aware of these high-RPM areas, your primary focus MUST be guided by the user's specific inputs. Use the high-RPM context mainly if the user's input is very broad or they ask for general strategy.

**User Input Interpretation (CRITICAL):**
- If the user provides a "Refine AI Suggestion" (userQuery), THIS IS THEIR PRIMARY INTENT. Synthesize this with "Specific App/Software" and "Primary Focus Niche" to define the core topic.
- If no userQuery, combine "Primary Focus Niche" (nicheName) and "Specific App/Software". If only one is provided, focus on that. 
- If neither Niche nor App/Software nor userQuery is provided, provide broad strategic advice, potentially drawing from the high-RPM niche context.
- The "Specific App/Software" can be a general tool (like an AI model 'Claude', 'ChatGPT') and the "Primary Focus Niche" or "userQuery" defines its application domain (e.g., 'Video Editing', 'Graphic Design').

**Phase 1: Strategic Guidance (Always provide, even if brief)**
Based on the interpreted core topic (derived from user inputs and validated with Google Search), provide a concise strategic recommendation. 
Crucially, include 1-2 brief, specific examples of supporting data or search insights from Google Search that led to this recommendation.
Identify high-potential niches, specific apps/software, and video types (e.g., 'beginner guides', 'troubleshooting') that exhibit high search volume potential, high RPMs, and truly evergreen demand, informed by Google Search. 
Format as: "STRATEGY_GUIDANCE: [Your precise, actionable strategic advice. Example: 'Google Search confirms high interest in using Claude for automating video editing workflows (e.g., search volume for "Claude video subtitle generator" has tripled in 3 months; top tutorials are outdated). Focus on step-by-step tutorials for specific tasks like auto-generating subtitles or rough cuts.']"

**Phase 2: Specific Video Ideas with Optimal Keywords & Rationale (7-10 ideas)**
For each video title (related to the core topic):
- The title must be compelling, directly answer a user's search intent, and incorporate optimal keywords.
- Identify 3-5 optimal, high-search-intent, high-RPM, evergreen keywords for that specific video, validated by Google Search.
- Provide a brief rationale explaining how Google Search results indicate this topic aligns with common search queries or addresses a widespread user need for the core topic, and what makes this idea a good opportunity based on these search insights.
- Ensure ideas align with high-RPM areas where possible, using Google Search to confirm current relevance.

Consider (and validate with Google Search for the core topic):
- Emerging use cases for tools/platforms/apps that lack good tutorials.
- New features/updates in popular software/platforms that generate new "how-to" queries.
- Common user pain points, recurring questions, and troubleshooting scenarios.

**Output Format (VERY STRICT):**
1.  Always start with 'STRATEGY_GUIDANCE:' on its own line.
2.  Immediately following, list each video idea on a new line.
3.  After each video idea, on a new line, list its keywords: "KEYWORDS: keyword1, keyword2, keyword3".
4.  After keywords, on a new line, provide rationale: "RATIONALE: Your rationale here."
Do NOT use numbering or bullet points for ideas/keywords/rationales. Each part on its own line.
`;

  let prompt = `Generate video ideas for YouTube, leveraging Google Search to focus on topics with high search demand and clear user needs. Prioritize the user's 'Refine AI Suggestion' if provided, to define the core topic.`;
  const hasNiche = nicheName && nicheName.trim() && nicheName !== "Select a Niche (or AI will suggest)";
  const hasApp = appSoftware && appSoftware.trim();
  const hasUserQuery = userQuery && userQuery.trim();

  let focusDescription = "Broad content strategy requested. Provide overarching STRATEGY_GUIDANCE based on Google Search for high-potential areas (referencing the provided high-RPM context if applicable), then generate specific video ideas for those general high-value areas.";

  if (hasUserQuery) {
    focusDescription = `User's primary focus (from 'Refine AI Suggestion'): "${userQuery.trim()}"`;
    if (hasApp) focusDescription += `, potentially applied to App/Software: "${appSoftware.trim()}"`;
    if (hasNiche) focusDescription += `, within the general context of Niche: "${nicheName.trim()}"`;
  } else if (hasNiche && hasApp) {
    focusDescription = `Primary focus: Niche "${nicheName.trim()}", App/Software "${appSoftware.trim()}".`;
  } else if (hasNiche) {
    focusDescription = `Primary focus: Niche "${nicheName.trim()}".`;
  } else if (hasApp) { 
    focusDescription = `Primary focus: App/Software "${appSoftware.trim()}".`;
  }
  
  prompt += `\n${focusDescription}.`;
  prompt += `\n\nAdhere strictly to the Output Format: STRATEGY_GUIDANCE, then Idea, then KEYWORDS, then RATIONALE, each on a new line.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            tools: [{ googleSearch: {} }], 
            temperature: 0.7, 
            topP: 0.9,
            topK: 50,
        }
    });
    
    const rawText = response.text; 
    const text = sanitizeAIResponseText(rawText); 
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
  ideaText: string, 
  niche: string,
  appSoftware: string,
  targetLengthMinutes: number = 5,
  optimalKeywords?: string[],
  strategicAngle?: string 
): Promise<{ script: string; instructions: string; resources: string[] }> => {
  if (shouldUseMockData) {
      console.warn("Gemini (generateScript): Missing/placeholder VITE_API_KEY. Returning mock data.");
      await new Promise(resolve => setTimeout(resolve, 700));
      let scriptOpening = `[MOCK SCRIPT for: "${ideaText}"]\n\nToday, I'm going to show you exactly how to ${ideaText.toLowerCase().replace(/^how to /,'').replace(/\?$/,'')}.`;
      if (optimalKeywords && optimalKeywords.length > 0) {
          scriptOpening += `\n(Optimal keywords like '${optimalKeywords.join("', '")}' will be naturally integrated.)`;
      }
      if (strategicAngle) {
        scriptOpening += `\n(Strategic Angle for this script: ${strategicAngle.substring(0,100)}...)`;
      }
      return {
          script: sanitizeAIResponseText(`${scriptOpening}\n\n**Step 1: Initial Setup**\n- Briefly explain the first crucial step for ${ideaText.toLowerCase().replace(/^how to /,'').replace(/\?$/,'')}.\n- For example, if setting up a budget for Rent: $1800, Groceries: $350, Utilities: $150.\n\n**Step 2: Core Process**\n- Detail the main actions for ${appSoftware || 'the task'}.\n- If you're finding this helpful, please take a moment to like this video and subscribe for more tutorials like this. Now, let's continue with the next step...\n\n**Step 3: Finalization & Tips**\n- Cover any concluding actions and offer one quick tip. \n\nThat's how you ${ideaText.toLowerCase().replace(/^how to /,'').replace(/\?$/,'')}. How have you used ${appSoftware || 'this method'} for ${niche}? Let us know in the comments below! If this was helpful, please like and subscribe for more!`),
          instructions: sanitizeAIResponseText(`[MOCK VIDEO INSTRUCTIONS for "${ideaText}"]\n\n**1. Recording Setup:**\n- Ensure OBS Studio is ready for a single-take recording.\n- Have notes for keywords: ${optimalKeywords ? optimalKeywords.join(', ') : 'N/A'}.\n\n**2. Delivery:**\n- Speak clearly and directly. Move from step to step without filler.\n- Show on screen what's being described for ${appSoftware || 'the process'}.\n\n**3. Visuals:**\n- Minimal on-screen text needed if delivery is clear. Maybe a title card.`),
          resources: [
            `Official ${appSoftware || niche} quick start guide (Search: "${appSoftware || niche} quick start")`,
            `OBS Studio setup tutorial (Search: "OBS Studio beginner tutorial")`,
          ].map(r => sanitizeAIResponseText(r))
      };
  }

  let systemInstruction = `You are an expert technical writer and YouTube instructional video script creator.
Your output MUST be direct, concise, and highly instructional.
The script is for a "quick and dirty," minimal-edit, OBS Studio style screen recording.
The creator wants to get straight to the point and deliver information efficiently.
ABSOLUTELY NO fluff, overly conversational intros/outros, rhetorical questions to the audience, or unnecessary empathetic statements (e.g., "Are you struggling with X?").
The tone must be professional, direct, helpful, and authoritative.`;

  let prompt = `Generate a comprehensive script and step-by-step video production instructions for a YouTube video titled "${ideaText}".
The video should be approximately ${targetLengthMinutes} minutes long.
The niche is '${niche}'${appSoftware ? ` and the software/app in focus is '${appSoftware}'` : ''}.
${optimalKeywords && optimalKeywords.length > 0 ? `Key SEO terms to naturally incorporate: ${optimalKeywords.join(', ')}.` : ''}
`;

  if (strategicAngle && strategicAngle.trim() !== "" && !strategicAngle.toLowerCase().includes("error during analysis") && !strategicAngle.toLowerCase().includes("error during generation")) {
    prompt += `\n**CRITICAL STRATEGIC ANGLE TO INCORPORATE:**\n${strategicAngle}\nThe script's content, examples, and tone MUST reflect and deliver on this strategic angle. Emphasize the unique selling points or insights mentioned in this angle throughout the script.\n`;
    systemInstruction += `\nThe script MUST align with and highlight the provided CRITICAL STRATEGIC ANGLE. All parts of the script, especially the introduction, core examples, and conclusion, should be tailored to reinforce this angle.`;
  }


  prompt += `
**Part 1: Video Script (Full Text for Direct Delivery)**

*   **Introduction (Very Brief - Max 10-15 seconds):**
    *   MUST start with a direct statement of the video's purpose. Example: "In this video, I'm going to show you exactly how to ${appSoftware ? `use ${appSoftware} to ` : ''}${ideaText.toLowerCase().replace(/^how to /,'').replace(/\?$/,'')}. Let's get started." OR "Today, we're covering how to ${appSoftware ? `use ${appSoftware} for ` : ''}${ideaText.toLowerCase().replace(/^how to /,'').replace(/\?$/,'')}. Here's how."
    *   If a strategic angle was provided, the introduction MUST immediately set the stage for that angle. For instance, if the angle is about 'untapped secrets', the intro should promise to reveal these secrets related to "${ideaText}".
    *   DO NOT use phrases like "Are you having problems with..." or "Have you ever wondered...".

*   **Main Content (Step-by-Step Instructions):**
    *   MUST be a clear, numbered list (Step 1:, Step 2:, Step 3:, etc.) detailing the actions.
    *   Each step must be concise, actionable, and easy to follow for a screen recording.
    *   Explain *what* to do and *how* to do it directly.
    *   When listing example categories for concepts like budgeting or planning (e.g., budget items like rent, groceries, entertainment; project tasks), PROVIDE PLAUSIBLE, ILLUSTRATIVE MONETARY/QUANTITATIVE EXAMPLES. For instance, if discussing budget categories: "For example, your budget might include Rent: $1850, Groceries: $450, Transportation: $150, and Entertainment: $100." If discussing project tasks: "This could mean Task A takes 2 hours, Task B takes 4 hours, and Task C (using ${appSoftware || 'the tool'}) takes 1 hour."
    *   Naturally integrate keywords if they fit the instructional context.
    *   Include essential practical tips or common pitfalls *briefly* within relevant steps.
    *   If a strategic angle was provided, ensure the steps, examples, and tips explicitly support and demonstrate this angle. (e.g., if the angle is 'untapped secrets', the steps should reveal these secrets).
    *   **Mid-Roll Engagement Prompt:** Somewhere in the middle of the main content (e.g., after completing a significant step or before moving to a new section), include a brief reminder: "If you're finding this tutorial helpful so far, please take a moment to hit that like button and subscribe for more content like this. Your support really helps the channel! Now, let's continue with Step X..."

*   **Conclusion (Brief - Max 20-30 seconds):**
    *   MUST include:
        1. A short summary of what was achieved (e.g., "And that's how you can easily ${appSoftware ? `use ${appSoftware} to ` : ''}${ideaText.toLowerCase().replace(/^how to /,'').replace(/\?$/,'')}."). If a strategic angle was provided, briefly reiterate how the video addressed that angle.
        2. A specific engagement question related to the video's topic, prompting comments. Example: "How have you used ${appSoftware || 'this technique'} for your own ${niche} projects? Or what other features of ${appSoftware || 'this topic'} would you like to see covered? Let me know in the comments below!"
        3. A clear call to action: "If this video was helpful, please give it a thumbs up, subscribe for more tutorials, and hit that notification bell so you don't miss out on future content. Thanks for watching!"
    *   DO NOT use lengthy wrap-ups.

*   Ensure the script length is suitable for a ${targetLengthMinutes}-minute direct-to-camera/screen recording.

**Part 2: Video Production Instructions (Guide for OBS Studio single-take style)**

*   **Preparation:**
    *   What specific windows, applications (${appSoftware || 'relevant tools'}), or websites should be open and ready before starting OBS recording?
    *   Briefly note any key points or keywords to emphasize during specific steps. If a strategic angle was provided, highlight key phrases or concepts from the angle to emphasize visually or verbally.
*   **Screen Recording & Delivery:**
    *   For each script step, what exactly should be shown on screen? (e.g., "Step 1: Show the ${appSoftware || 'interface'} and click on the 'File' menu...").
    *   Advise on clear, direct verbal delivery for each step.
    *   Suggestions for mouse cursor highlighting or minimal on-screen annotations if absolutely necessary for clarity (assume minimal post-editing).
*   **Pacing:**
    *   Advise on maintaining a steady pace suitable for a ${targetLengthMinutes}-minute video, allowing viewers to follow screen actions without rushing.

**Part 3: Tailored Suggested Resources (Highly Specific & Actionable)**

*   Provide 2-3 **highly specific external resources** directly relevant to "${ideaText}".
    *   Prioritize official documentation URLs, specific help articles, or direct links to relevant tools/templates.
    *   If a URL isn't feasible, describe precisely what to search for (e.g., "Search official ${appSoftware || niche} documentation for '[specific feature from ${ideaText}] guide'").

**Output Format:** Clearly use headings: **Part 1: Video Script**, **Part 2: Video Production Instructions**, **Part 3: Suggested Resources**.
---
Begin Generation:
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: { 
            systemInstruction: systemInstruction,
            temperature: 0.5, 
            topP: 0.85, 
            topK: 40 
        }
    });

    const rawText = response.text;
    // Sanitize the entire raw text first
    const sanitizedRawText = sanitizeAIResponseText(rawText); 

     if (!sanitizedRawText) {
        console.warn("Gemini API returned empty text response for script generation.");
        // Ensure even error messages are sanitized
        return { script: sanitizeAIResponseText('Script generation failed: Empty response from AI.'), instructions: sanitizeAIResponseText('Instructions generation failed.'), resources: [] };
    }

    let script = sanitizeAIResponseText('Script generation failed: Could not parse Part 1.');
    let instructions = sanitizeAIResponseText('Instructions generation failed: Could not parse Part 2.');
    let resources: string[] = [];

    // Extract parts from the already sanitizedRawText
    const scriptMatch = sanitizedRawText.match(/\*\*Part 1: Video Script\*\*\s*([\s\S]*?)(?=\*\*Part 2: Video Production Instructions\*\*|$)/);
    if (scriptMatch && scriptMatch[1]) {
        // Sanitize the extracted part again, just in case the regex captured something complex
        script = sanitizeAIResponseText(scriptMatch[1].trim());
    }

    const instructionsMatch = sanitizedRawText.match(/\*\*Part 2: Video Production Instructions\*\*\s*([\s\S]*?)(?=\*\*Part 3: Suggested Resources\*\*|$)/);
    if (instructionsMatch && instructionsMatch[1]) {
        instructions = sanitizeAIResponseText(instructionsMatch[1].trim());
    }

    const resourcesMatch = sanitizedRawText.match(/\*\*Part 3: Suggested Resources\*\*\s*([\s\S]*)/);
    if (resourcesMatch && resourcesMatch[1]) {
        const extractedResourcesText = sanitizeAIResponseText(resourcesMatch[1].trim());
        resources = extractedResourcesText.split('\n')
                      .map(r => sanitizeAIResponseText(r.replace(/^(\* |- )/,'').trim())) // Sanitize each resource line
                      .filter(r => r.length > 5); 
    }
    
    return { 
        script: script, 
        instructions: instructions, 
        resources: resources // Already sanitized
    };

  } catch (error) {
    console.error('Error calling Gemini API for script generation:', error);
    let message = 'An unknown error occurred during script generation.';
    if (error instanceof Error) message = `Gemini API error for script: ${error.message}`;
    // Ensure error messages are also sanitized
    return { script: sanitizeAIResponseText(`Script Generation Error: ${message}`), instructions: sanitizeAIResponseText('Instructions generation failed due to API error.'), resources: [] };
  }
};

export const expandIdeaIntoRelatedIdeas = async (
  ideaText: string,
  niche: string,
  appSoftware: string
): Promise<Array<{text: string, keywords: string[]}>> => { 
  if (shouldUseMockData) {
      console.warn("Gemini (expandIdea): Missing/placeholder VITE_API_KEY. Returning mock data.");
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
          {
            text: sanitizeAIResponseText(`[MOCK] Advanced Techniques for: "${ideaText.substring(0,30)}..." using ${appSoftware || 'related tools'} in ${niche}. Focus: Hyper-specific example 1.`),
            keywords: [`advanced ${appSoftware || niche}`, `${ideaText.substring(0,10)} expert tricks`, `${niche} pro guide`]
          },
          {
            text: sanitizeAIResponseText(`[MOCK] Troubleshooting rare error XYZ with ${appSoftware || 'this topic'} for "${ideaText.substring(0,20)}..." for niche users.`),
            keywords: [`${appSoftware || niche} specific error XYZ`, `fix ${ideaText.substring(0,10)} rare problem`, `${niche} specific troubleshooting`]
          },
           {
            text: sanitizeAIResponseText(`[MOCK] How to use ${appSoftware || 'this tool'} to achieve [Hyper-Specific Task, e.g., 'automate window washing schedules'] within the ${niche} context.`),
            keywords: [`${appSoftware || niche} for window washing`, `automate specific task ${niche}`, `unusual uses of ${appSoftware}`]
          }
      ];
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
        model: modelName,
        contents: prompt,
        config: { temperature: 0.8, topP: 0.95, topK: 50 }
    });

    const rawText = response.text; 
    const text = sanitizeAIResponseText(rawText); 

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
            expandedIdeasWithKeywords.push({ text: ideaTitle, keywords });
        }
    }
    return expandedIdeasWithKeywords.map(idea => ({ // Sanitize each part
        text: sanitizeAIResponseText(idea.text),
        keywords: idea.keywords.map(k => sanitizeAIResponseText(k))
    }));

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
    console.warn("Gemini (generateKeywords): Missing/placeholder VITE_API_KEY. Returning mock data.");
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      keywords: [
        `mock keyword ${appSoftware || niche}`,
        `mock ${niche} tutorial ${appSoftware || ''}`,
        `how to ${ideaText.substring(0,15)} ${appSoftware || ''}`,
        `${appSoftware || niche} tips`,
        `best ${niche} ${appSoftware || 'guide'}`,
      ].map(k => sanitizeAIResponseText(k)), // Sanitize mock keywords
      groundingChunks: [
        { web: { uri: "https://mock-source-1.com", title: "Mock Source for Keywords 1" } },
        { web: { uri: "https://mock-source-2.com/article", title: "Another Mock Keyword Article" } },
      ]
    };
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
      model: modelName,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], 
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
      },
    });

    const rawText = response.text; 
    const text = sanitizeAIResponseText(rawText); 
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;

    if (!text) {
      console.warn("Gemini API returned empty text response for keyword generation.");
      return { keywords: [], groundingChunks };
    }

    const generatedKeywords = text
      .split('\n')
      .map(line => sanitizeAIResponseText(line.trim())) // Sanitize each keyword
      .map(line => line.replace(/^(- |\* |\d+\. )/, '').trim()) 
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
    console.warn("Gemini (generateTitleSuggestions): Missing/placeholder VITE_API_KEY. Returning mock data.");
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        suggestedTitle: sanitizeAIResponseText(`[MOCK] REVEALED: The Secret to Using ${appSoftware || 'Topic'} for ${niche}!`),
        rationale: sanitizeAIResponseText("Uses a stronger hook ('REVEALED', 'Secret') and directly mentions the benefit.")
      },
      {
        suggestedTitle: sanitizeAIResponseText(`[MOCK] ${appSoftware || 'Topic'} ${niche} Tutorial: Ultimate Guide 2024`),
        rationale: sanitizeAIResponseText("More SEO-friendly, includes 'Tutorial', 'Ultimate Guide', and current year.")
      }
    ];
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
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], 
        temperature: 0.72, 
        topP: 0.9,
        topK: 50,
      }
    });

    const rawText = response.text;
    const text = sanitizeAIResponseText(rawText); 

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
          suggestedTitle: sanitizeAIResponseText(suggestionMatch[1].trim()), // Sanitize
          rationale: sanitizeAIResponseText(suggestionMatch[2].trim()),      // Sanitize
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
        console.warn("Gemini (analyzeYouTubeCompetitorsForAngles): Missing/placeholder VITE_API_KEY. Returning mock data.");
        await new Promise(resolve => setTimeout(resolve, 400));
        if (competitorVideos.length === 0) return sanitizeAIResponseText("AI STRATEGIC ANGLE:\nOverall Assessment: Mock: No competitor videos found. This topic seems wide open!\nActionable Angles:\n*   Focus on a comprehensive beginner's guide, clearly dated for the current year (e.g., 2024).\n*   Highlight unique benefits or ease of use if applicable to the idea.\n*   Create a visually appealing thumbnail that stands out.");
        const mockComp = competitorVideos[0];
        return sanitizeAIResponseText(`AI STRATEGIC ANGLE:\nOverall Assessment: Mock: Given competitors like "${mockComp.title}" (Views: ${mockComp.viewCountText}, Age: ${mockComp.publishedAtText}, Channel Subs: ${mockComp.channelSubscriberCountText}), there's some existing content.\nActionable Angles:\n*   Consider an up-to-date (e.g., 2024) version for "${ideaText}" if competitor content is older.\n*   Explore a unique practical example or a niche application not covered by others.\n*   If competitors have low subscriber counts but high views on similar topics, it indicates strong demand; focus on higher quality production or clearer explanations.`);
    }
    if (!API_KEY) return sanitizeAIResponseText('AI STRATEGIC ANGLE:\nOverall Assessment: API Key not configured. Cannot analyze competitors.\nActionable Angles:\n*   Manually review competitor videos for gaps and opportunities.');

    const competitorInfo = competitorVideos
      .map(vid => `- Title: "${vid.title}"\n  Views: ${vid.viewCountText}\n  Age: ${vid.publishedAtText}\n  Channel Subscribers: ${vid.channelSubscriberCountText || 'N/A'}\n  Description Snippet: "${vid.descriptionSnippet || 'N/A'}"`)
      .slice(0, 7) 
      .join('\n---\n');

    const prompt = `You are an expert YouTube Content Strategist.
Your task is to analyze the provided competitor video data for the target video idea: "${ideaText}".

Competitor Videos Data:
${competitorInfo.length > 0 ? competitorInfo : "No competitor videos found in the top search results."}

Based on this data, provide:
1.  **Overall Assessment (1-2 concise sentences):** Briefly summarize the competitive landscape.
    *   Is it crowded, sparse, or dominated by old content?
    *   Are there videos from channels with relatively low subscriber counts getting high views (this indicates strong organic topic demand)?
    *   What is the general sentiment or quality of existing top videos?
    *   Critically, if keywords like "untapped," "secrets," "hidden," or similar appear in the original idea text ("${ideaText}"), assess if the competitor data truly reflects a gap related to these "untapped" aspects. For example, if "${ideaText}" is "Untapped ChatGPT Prompt Secrets," and no competitor videos explicitly cover "prompt secrets" or "bad results," highlight this as a significant content gap.

2.  **Actionable Strategic Angles (2-3 distinct bullet points):** Suggest specific, actionable angles or improvements a new video on "${ideaText}" could focus on to differentiate itself and offer more value. For each angle, be specific and explain *why* it's a good strategy based on the competitor data (or lack thereof).
    *   **Content Gaps/Depth:** If competitors miss key aspects or only cover them superficially, suggest covering these. (e.g., "Dive deeper into [specific sub-topic] which current videos only touch on.")
    *   **Freshness/Updates:** If existing videos are old (e.g., >1-2 years), emphasize creating an up-to-date version. (e.g., "Create an 'Update for [Current Year]' guide, as most top videos are from [Year].")
    *   **Unique Value Proposition:** How can the new video be clearer, more engaging, solve a specific problem better, or offer a unique perspective? (e.g., "Focus on a hands-on, project-based tutorial if others are mostly theoretical," or "Offer a 'pro tips' angle if beginner content is saturated.") If the idea implies an "untapped" or "secret" angle that competitors don't address, make this the primary value proposition.
    *   **Niche Down/Audience Focus:** Could targeting a specific sub-audience or use-case be beneficial? (e.g., "Create a guide specifically for [e.g., small business owners] using [Tool] for [Task related to IdeaText]").
    *   **Leverage View/Subscriber Discrepancies:** If videos from channels with few subscribers have high views, this signals strong topic interest and potentially lower quality competition. How can this be capitalized on? (e.g., "Multiple smaller channels achieve high views, indicating strong topic demand. A high-quality, comprehensive video could dominate.")
    *   **Title/Thumbnail Strategy Hint:** Briefly suggest how the title/thumbnail could reflect the unique angle. (e.g., "Angle your title to highlight the 'for [Specific Audience]' aspect.")

Output Format:
Start with "AI STRATEGIC ANGLE:" (all caps).
Then, on a new line, "Overall Assessment:" followed by your assessment.
Then, on a new line, "Actionable Angles:" followed by bulleted suggestions (using '*' for bullets).

Example:
AI STRATEGIC ANGLE:
Overall Assessment: The topic has several videos, but many are over two years old and focus on broad overviews. One video from a channel with only 5K subscribers has 100K views, indicating high interest in practical application.
Actionable Angles:
*   Develop a comprehensive, up-to-date ([Current Year]) tutorial focusing on practical application with a real-world project example. Existing content lacks this depth.
*   If competitors are mostly theoretical, create a step-by-step, hands-on guide showing the "how-to" in detail for a specific challenging aspect of "${ideaText}".
*   Target beginners specifically if current videos assume too much prior knowledge. Title could be: "${ideaText} - The ULTIMATE Beginner's Guide ([Current Year])".
`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { temperature: 0.68, topP: 0.92, topK: 45 }
        });
        
        const rawText = response.text;
        const text = sanitizeAIResponseText(rawText); 

        if (!text) {
          return sanitizeAIResponseText('AI STRATEGIC ANGLE:\nOverall Assessment: AI analysis did not return a specific insight.\nActionable Angles:\n*   Consider general best practices: up-to-date content, clear explanations, and unique examples.');
        }
        // Ensure the output starts with the expected prefix, and sanitize the entire AI response
        const prefixedText = text.trim().startsWith("AI STRATEGIC ANGLE:") ? text.trim() : `AI STRATEGIC ANGLE:\n${text.trim()}`;
        return sanitizeAIResponseText(prefixedText);

    } catch (error) {
        console.error('Error calling Gemini API for competitor analysis:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during AI analysis.';
        return sanitizeAIResponseText(`AI STRATEGIC ANGLE:\nOverall Assessment: Error during analysis - ${errorMessage}\nActionable Angles:\n*   Review competitor videos manually to identify gaps.`);
    }
};
