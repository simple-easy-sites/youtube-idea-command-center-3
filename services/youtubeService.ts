// services/youtubeService.ts

/**
 * WARNING: Using API keys directly in client-side code (like this)
 * exposes them to users and is a security risk. For production,
 * it is STRONGLY RECOMMENDED to proxy API calls through a secure
 * backend server where API keys can be stored safely.
 * 
 * The YOUTUBE_API_KEY is expected to be injected via Vite's process.env handling.
 * Ensure your .env.local (or .env) file has YOUTUBE_API_KEY set.
 */

import { YouTubeVideoResult } from '../types';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_ACTUAL_YOUTUBE_API_KEY_HERE" || YOUTUBE_API_KEY === "MISSING_YOUTUBE_API_KEY") { // Added common placeholder
  console.error("YouTube API key is missing or a placeholder (process.env.YOUTUBE_API_KEY). Real YouTube searches will fail. Ensure it's set in your .env file or AI Studio Secrets.");
}

export const searchYouTubeForExistingVideos = async (
  query: string,
  maxResults: number = 5
): Promise<YouTubeVideoResult[]> => {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_ACTUAL_YOUTUBE_API_KEY_HERE" || YOUTUBE_API_KEY === "MISSING_YOUTUBE_API_KEY") {
    console.warn("YouTube API key is not configured or is a placeholder. Returning mock data. Ensure process.env.YOUTUBE_API_KEY is correctly set.");
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const mockResults: YouTubeVideoResult[] = [];
    for (let i = 1; i <= maxResults; i++) {
      const monthsAgo = Math.floor(Math.random() * 36) + 1; 
      const mockDate = new Date();
      mockDate.setMonth(mockDate.getMonth() - monthsAgo);
      mockResults.push({
        title: `[MOCK] How to ${query.substring(0, 40)}... - Video ${i}`,
        videoId: `mockVideoId_${i}_${Date.now()}`,
        thumbnailUrl: `https://via.placeholder.com/168x94.png?text=Mock+Video+${i}`,
        channelTitle: `Mock Channel ${i}`,
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

  try {
    // Step 1: Search for videos
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY,
    });
    const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams.toString()}`);
    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      console.error('YouTube Search API Error Response:', errorData);
      throw new Error(`YouTube Search API Error (${searchResponse.status}): ${errorData.error?.message || searchResponse.statusText}`);
    }
    const searchData = await searchResponse.json();

    const videoIds = searchData.items?.map((item: any) => item.id?.videoId).filter(Boolean) || [];
    if (videoIds.length === 0) {
      return []; 
    }

    // Step 2: Get statistics (views, etc.) and full snippet (including description) for found videos
    const videoParams = new URLSearchParams({
      part: 'statistics,snippet', // snippet for title, thumbnails, channelTitle, publishedAt, description; statistics for viewCount
      id: videoIds.join(','),
      key: YOUTUBE_API_KEY,
    });
    const videoResponse = await fetch(`${YOUTUBE_VIDEOS_URL}?${videoParams.toString()}`);
    if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        console.error('YouTube Videos API Error Response:', errorData);
        throw new Error(`YouTube Videos API Error (${videoResponse.status}): ${errorData.error?.message || videoResponse.statusText}`);
    }
    const videoData = await videoResponse.json();

    const results: YouTubeVideoResult[] = videoData.items?.map((item: any) => {
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
      
      // Extract a snippet of the description
      const description = item.snippet?.description || '';
      const descriptionSnippet = description.substring(0, 150) + (description.length > 150 ? '...' : '');

      return {
        title: item.snippet?.title || 'Unknown Title',
        videoId: item.id, 
        thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url,
        channelTitle: item.snippet?.channelTitle || 'Unknown Channel',
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
            throw new Error("YouTube API key is invalid. Please check your .env.local file and ensure it's correct.");
        }
        if (error.message.includes(" Zugriff nicht konfiguriert") || error.message.includes("API not enabled")) { // German for "Access not configured"
             throw new Error("The YouTube Data API v3 is not enabled for your project or key. Please enable it in Google Cloud Console.");
        }
        throw new Error(`Failed to fetch YouTube videos: ${error.message}`);
    }
    throw new Error("An unknown error occurred while fetching YouTube videos.");
  }
};