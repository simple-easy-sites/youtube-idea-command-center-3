// services/youtubeService.ts

/**
 * WARNING: Using API keys directly in client-side code (like this)
 * exposes them to users and is a security risk if not properly restricted.
 * For production, ensure the YOUTUBE_API_KEY is restricted (e.g., HTTP referrers)
 * in the Google Cloud Console.
 * 
 * The YOUTUBE_API_KEY is expected to be injected via Vite's import.meta.env handling.
 * Ensure your Vercel environment variables are set to VITE_YOUTUBE_API_KEY.
 */

import { YouTubeVideoResult } from '../types';

// Use import.meta.env for Vite environment variables
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_ACTUAL_YOUTUBE_API_KEY_HERE" || YOUTUBE_API_KEY === "MISSING_YOUTUBE_API_KEY") {
  console.error("YouTube Service: VITE_YOUTUBE_API_KEY is missing or a placeholder. Real YouTube searches will fail. Ensure VITE_YOUTUBE_API_KEY is set in Vercel Environment Variables.");
}

const formatSubscriberCount = (count: string): string => {
    const num = parseInt(count);
    if (isNaN(num)) return "N/A subscribers";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M subscribers';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K subscribers';
    return `${num} subscribers`;
};


export const searchYouTubeForExistingVideos = async (
  query: string,
  maxResults: number = 10 // Increased from 5 to 10
): Promise<YouTubeVideoResult[]> => {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_ACTUAL_YOUTUBE_API_KEY_HERE" || YOUTUBE_API_KEY === "MISSING_YOUTUBE_API_KEY") {
    console.warn("YouTube Service: Missing/placeholder VITE_YOUTUBE_API_KEY. Returning mock data.");
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const mockResults: YouTubeVideoResult[] = [];
    for (let i = 1; i <= maxResults; i++) {
      const monthsAgo = Math.floor(Math.random() * 36) + 1; 
      const mockDate = new Date();
      mockDate.setMonth(mockDate.getMonth() - monthsAgo);
      const mockSubscribers = Math.floor(Math.random() * 100000) + 100;
      mockResults.push({
        title: `[MOCK] How to ${query.substring(0, 40)}... - Video ${i}`,
        videoId: `mockVideoId_${i}_${Date.now()}`,
        thumbnailUrl: `https://via.placeholder.com/168x94.png?text=Mock+Video+${i}`,
        channelTitle: `Mock Channel ${i}`,
        channelId: `mockChannelId_${i}`,
        channelSubscriberCountText: formatSubscriberCount(mockSubscribers.toString()),
        viewCountText: `${Math.floor(Math.random() * 1000) +1}K views`,
        publishedAtText: monthsAgo > 12 ? `${Math.floor(monthsAgo/12)} year(s) ago` : `${monthsAgo} month(s) ago`,
        publishedAtDate: mockDate,
        descriptionSnippet: `This is a mock description for the video about ${query.substring(0,40)}. It covers key aspects and provides useful information for viewers. Mock video ${i}.`
      });
    }
    return mockResults;
  }

  const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
  const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
  const YOUTUBE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';

  try {
    // Step 1: Search for videos (gets videoId, title, channelId, channelTitle from snippet)
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY,
      relevanceLanguage: 'en', // Added for better search results
      regionCode: 'US', // Added for better search results
    });
    const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams.toString()}`);
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube Search API Error Response:', errorData);
      throw new Error(`YouTube Search API Error (${searchResponse.status}): ${errorData.error?.message || searchResponse.statusText}`);
    }
    const searchData = await searchResponse.json();

    const videoSnippets = searchData.items?.map((item: any) => ({
        videoId: item.id?.videoId,
        channelId: item.snippet?.channelId,
        channelTitle: item.snippet?.channelTitle,
    })).filter((item: any) => item.videoId && item.channelId) || [];

    if (videoSnippets.length === 0) {
      return []; 
    }

    const videoIds = videoSnippets.map((snippet: any) => snippet.videoId);
    const channelIds = [...new Set(videoSnippets.map((snippet: any) => snippet.channelId))]; // Unique channel IDs

    // Step 2: Get statistics (views, etc.) and full snippet for found videos
    const videoDetailsParams = new URLSearchParams({
      part: 'statistics,snippet', 
      id: videoIds.join(','),
      key: YOUTUBE_API_KEY,
    });
    const videoDetailsResponse = await fetch(`${YOUTUBE_VIDEOS_URL}?${videoDetailsParams.toString()}`);
    if (!videoDetailsResponse.ok) {
        const errorData = await videoDetailsResponse.json();
        console.error('YouTube Videos API Error Response:', errorData);
        throw new Error(`YouTube Videos API Error (${videoDetailsResponse.status}): ${errorData.error?.message || videoDetailsResponse.statusText}`);
    }
    const videoDetailsData = await videoDetailsResponse.json();
    
    // Step 3: Get subscriber counts for channels
    let channelStatsMap = new Map<string, string>();
    if (channelIds.length > 0) {
        const channelParams = new URLSearchParams({
            part: 'statistics',
            id: channelIds.join(','),
            key: YOUTUBE_API_KEY,
        });
        const channelResponse = await fetch(`${YOUTUBE_CHANNELS_URL}?${channelParams.toString()}`);
        if (channelResponse.ok) {
            const channelData = await channelResponse.json();
            channelData.items?.forEach((channel: any) => {
                if (channel.id && channel.statistics?.subscriberCount) {
                    channelStatsMap.set(channel.id, formatSubscriberCount(channel.statistics.subscriberCount));
                }
            });
        } else {
            console.warn('Could not fetch channel statistics:', await channelResponse.text());
        }
    }


    const results: YouTubeVideoResult[] = videoDetailsData.items?.map((item: any) => {
      const viewCount = item.statistics?.viewCount ? parseInt(item.statistics.viewCount).toLocaleString() : 'N/A';
      
      let publishedAtText = 'Recently';
      let publishedAtDate : Date | undefined = undefined;

      if (item.snippet?.publishedAt) {
        publishedAtDate = new Date(item.snippet.publishedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - publishedAtDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30.44); 
        const diffYears = Math.floor(diffDays / 365.25); 

        if (diffYears > 0) {
          publishedAtText = `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
        } else if (diffMonths > 0) {
          publishedAtText = `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
        } else if (diffDays > 1) {
          publishedAtText = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffDays === 1) {
            publishedAtText = `1 day ago`;
        } else {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours > 0) {
                publishedAtText = `${diffHours} hour${diffHours > 1 ? 's':''} ago`;
            } else {
                const diffMinutes = Math.floor(diffTime / (1000*60));
                 if (diffMinutes > 0) {
                    publishedAtText = `${diffMinutes} minute${diffMinutes > 1 ? 's':''} ago`;
                 } else {
                    publishedAtText = `Just now`;
                 }
            }
        }
      }
      
      const description = item.snippet?.description || '';
      const descriptionSnippet = description.substring(0, 150) + (description.length > 150 ? '...' : '');
      const channelId = item.snippet?.channelId;

      return {
        title: item.snippet?.title || 'Unknown Title',
        videoId: item.id, 
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
        channelTitle: item.snippet?.channelTitle || 'Unknown Channel',
        channelId: channelId,
        channelSubscriberCountText: channelId ? channelStatsMap.get(channelId) || "N/A subscribers" : "N/A subscribers",
        viewCountText: `${viewCount} views`,
        publishedAtText: publishedAtText,
        publishedAtDate: publishedAtDate,
        descriptionSnippet: descriptionSnippet,
      };
    }) || [];
    return results;

  } catch (error) {
    console.error("Error searching YouTube:", error);
    if (error instanceof Error) {
        if (error.message.includes("quotaExceeded") || error.message.includes("usageLimits")) {
            throw new Error("YouTube API quota exceeded. Please try again later or check your quota in Google Cloud Console.");
        }
        if (error.message.includes("developerKeyInvalid") || error.message.includes("API key not valid")) {
            throw new Error("YouTube API key is invalid. Please check your Vercel Environment Variables (should be VITE_YOUTUBE_API_KEY).");
        }
        if (error.message.includes(" Zugriff nicht konfiguriert") || error.message.includes("API not enabled")) { // German for "Access not configured"
             throw new Error("The YouTube Data API v3 is not enabled for your project or key. Please enable it in Google Cloud Console.");
        }
        throw new Error(`Failed to fetch YouTube videos: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching YouTube videos.");
  }
};