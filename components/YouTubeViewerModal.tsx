


import React, { useState, useMemo } from 'react';
import { VideoIdea, YouTubeVideoResult, UntappedScore } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Button } from './ui/Button';
import { Select } from './ui/Select'; // Assuming Select can be used for sorting

interface YouTubeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: VideoIdea | null;
  onForceRefreshValidation: (ideaId: string, forceRefresh: boolean) => void;
}

type SortOption = 'relevance' | 'viewCountDesc' | 'publishedAtDesc' | 'publishedAtAsc' | 'durationAsc' | 'durationDesc';

const UntappedScoreDisplay: React.FC<{ score?: UntappedScore, summary?: string }> = ({ score, summary }) => {
  if (!score || score === 'Not Assessed') {
    return summary ? <p className="text-md text-sky-200 italic my-3">{summary}</p> : null;
  }

  let colorClasses = '';
  let textColor = 'text-gray-100';
  let textPrefix = 'Untapped Potential: ';

  switch (score) {
    case 'High': 
      colorClasses = 'bg-emerald-500/30 border-emerald-400'; 
      textColor = 'text-emerald-200'; 
      break;
    case 'Medium': 
      colorClasses = 'bg-yellow-500/30 border-yellow-400'; 
      textColor = 'text-yellow-200'; 
      break;
    case 'Low': 
      colorClasses = 'bg-orange-500/30 border-orange-400'; 
      textColor = 'text-orange-200'; 
      break;
    case 'Error': 
      colorClasses = 'bg-red-600/30 border-red-500'; 
      textColor = 'text-red-200';
      textPrefix = 'Validation Status: ';
       break;
    default: return null;
  }

  return (
    <div className={`p-4 my-4 rounded-lg border ${colorClasses} glass-card-subtle animate-fadeIn`}>
      <p className={`text-lg font-semibold ${textColor}`}>{textPrefix}{score}</p>
      {summary && <p className={`text-sm mt-1.5 ${textColor} opacity-90`}>{summary}</p>}
    </div>
  );
};

const YouTubeVideoCard: React.FC<{ video: YouTubeVideoResult }> = ({ video }) => {
  return (
    <a 
      href={`https://www.youtube.com/watch?v=${video.videoId}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="glass-card-subtle !p-4 rounded-xl flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4 hover:!shadow-sky-500/50 hover:!border-sky-400/70 transition-all duration-300 group animate-fadeIn" 
    >
      {video.thumbnailUrl && (
        <div className="relative w-full sm:w-48 flex-shrink-0 mb-3 sm:mb-0">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="w-full h-auto sm:h-[108px] object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow border border-[var(--glass-border-color)]" 
          />
          {video.duration && video.duration !== "N/A" && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md font-medium">
              {video.duration}
            </span>
          )}
        </div>
      )}
      <div className="flex-1">
        <h4 className="text-md font-semibold text-sky-300 group-hover:text-sky-100 transition-colors line-clamp-2" title={video.title}>
          {video.title}
        </h4>
        <p className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors mt-1.5">{video.channelTitle}</p>
        {video.channelSubscriberCountText && (
            <p className="text-xs text-sky-400/80 group-hover:text-sky-300 transition-colors mt-0.5">{video.channelSubscriberCountText}</p>
        )}
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors mt-2">
          <span>{video.viewCountText}</span>
          <div className="flex items-center space-x-2">
            {video.videoType && video.videoType !== "Unknown" && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${video.videoType === 'Short' ? 'bg-rose-500/30 text-rose-300 border border-rose-400/50' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'}`}>
                    {video.videoType}
                </span>
            )}
            <span>{video.publishedAtText}</span>
          </div>
        </div>
      </div>
    </a>
  );
};


export const YouTubeViewerModal: React.FC<YouTubeViewerModalProps> = ({ isOpen, onClose, idea, onForceRefreshValidation }) => {
  const [sortOrder, setSortOrder] = useState<SortOption>('relevance');

  if (!isOpen || !idea) return null;

  const isLoadingYouTubeResults = idea?.isYouTubeLoading ?? false;
  const rawResults = idea?.youtubeResults || [];
  const aiAngle = idea?.aiCompetitiveAngle || null;

  const parseViewCount = (viewCountText?: string): number => {
    if (!viewCountText) return 0;
    const cleanedText = viewCountText.toLowerCase().replace(/views|,/g, '').trim();
    let multiplier = 1;
    if (cleanedText.endsWith('k')) {
      multiplier = 1000;
    } else if (cleanedText.endsWith('m')) {
      multiplier = 1000000;
    } else if (cleanedText.endsWith('b')) {
      multiplier = 1000000000;
    }
    const num = parseFloat(cleanedText.replace(/[kmbt]/, ''));
    return isNaN(num) ? 0 : num * multiplier;
  };
  
  const parseDurationToSeconds = (duration?: string): number => {
    if (!duration || duration === "N/A") return 0;
    const parts = duration.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) { // HH:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // MM:SS
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) { // SS
      seconds = parts[0];
    }
    return seconds;
  };
  
  const sortedResults = useMemo(() => {
    const resultsCopy = [...rawResults];
    switch (sortOrder) {
        case 'viewCountDesc':
            return resultsCopy.sort((a, b) => parseViewCount(b.viewCountText) - parseViewCount(a.viewCountText));
        case 'publishedAtDesc':
            return resultsCopy.sort((a, b) => (b.publishedAtDate?.getTime() || 0) - (a.publishedAtDate?.getTime() || 0));
        case 'publishedAtAsc':
            return resultsCopy.sort((a, b) => (a.publishedAtDate?.getTime() || 0) - (b.publishedAtDate?.getTime() || 0));
        case 'durationAsc':
            return resultsCopy.sort((a, b) => parseDurationToSeconds(a.duration) - parseDurationToSeconds(b.duration));
        case 'durationDesc':
            return resultsCopy.sort((a, b) => parseDurationToSeconds(b.duration) - parseDurationToSeconds(a.duration));
        case 'relevance':
        default:
            return resultsCopy; 
    }
  }, [rawResults, sortOrder]);


  const handleRefresh = () => {
    if (idea) {
        onForceRefreshValidation(idea.id, true);
    }
  };
  
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Sort by Relevance' },
    { value: 'viewCountDesc', label: 'Sort by Views (High to Low)' },
    { value: 'publishedAtDesc', label: 'Sort by Newest First' },
    { value: 'publishedAtAsc', label: 'Sort by Oldest First' },
    { value: 'durationAsc', label: 'Sort by Length (Short to Long)' },
    { value: 'durationDesc', label: 'Sort by Length (Long to Short)' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="glass-card !rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl !border-blue-400/50" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 md:p-6 border-b border-[var(--glass-border-color)] flex justify-between items-center bg-gradient-to-r from-[var(--glass-bg-main-start)] via-[var(--glass-bg-main-end)] to-[var(--glass-bg-main-start)]">
          <h2 className="text-2xl font-semibold text-blue-300 truncate pr-4" title={idea.text}>
            YouTube Insights for: {idea.text.length > 45 ? idea.text.substring(0, 42) + '...' : idea.text}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-2 text-[var(--text-secondary)] hover:text-white !rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </header>

        <main className="p-5 md:p-6 space-y-5 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]">
          {isLoadingYouTubeResults && (!idea.untappedScore || idea.untappedScore === 'Not Assessed' || idea.validationSummary === 'Validating...' || idea.aiCompetitiveAngle === 'Analyzing...') ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <LoadingSpinner size="lg" color="text-blue-400" />
              <p className="mt-5 text-lg text-[var(--text-secondary)]">Fetching YouTube data & AI analysis...</p>
            </div>
          ) : (
            <>
              <UntappedScoreDisplay score={idea.untappedScore} summary={idea.validationSummary} />
              
              {aiAngle && aiAngle !== 'Analyzing...' && (
                <div className="my-4 p-4 rounded-lg border border-purple-500/40 bg-purple-700/20 glass-card-subtle animate-fadeIn">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">AI Strategic Angle & Insights:</h3>
                  {/* Render AI angle text in a div with pre-wrap for better formatting control */}
                  <div className="text-sm text-purple-200/90 whitespace-pre-wrap leading-relaxed">
                    {aiAngle.replace(/^AI STRATEGIC ANGLE:/i, '').trim()}
                  </div>
                </div>
              )}

              {sortedResults.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 space-y-2 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-sky-200">Similar YouTube Videos ({sortedResults.length}):</h3>
                    <Select
                        id="youtubeSortSelect"
                        options={sortOptions}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOption)}
                        className="!py-2 !text-sm !w-full sm:!w-auto !min-w-[180px]"
                        containerClassName="w-full sm:w-auto"
                    />
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] -mt-2 mb-3 italic">
                    Search results based on idea title: "{idea.text.length > 60 ? idea.text.substring(0,57) + '...' : idea.text}"
                  </p>
                  {sortedResults.map((video, index) => (
                    <div key={video.videoId + '-' + index} className="animate-fadeIn" style={{animationDelay: `${index * 0.07}s`}}>
                        <YouTubeVideoCard video={video} />
                    </div>
                  ))}
                </div>
              ) : (
                !isLoadingYouTubeResults && (
                    <p className="text-center text-[var(--text-secondary)] italic py-12 text-lg">
                    {idea.youtubeResults === undefined && !idea.validationSummary?.toLowerCase().includes("error") ? "Click 'Validate on YouTube' to see competitor videos." : "No YouTube videos found for this idea, or there was an error fetching them."}
                    </p>
                )
              )}
            </>
          )}
        </main>
         <footer className="p-4 md:p-5 border-t border-[var(--glass-border-color)] flex justify-between items-center bg-gradient-to-r from-[var(--glass-bg-main-end)] via-[var(--glass-bg-subtle-start)] to-[var(--glass-bg-main-end)]">
            <Button 
                variant="ghost" 
                onClick={handleRefresh} 
                size="md" 
                className="!font-semibold text-sky-400 hover:text-sky-200"
                disabled={isLoadingYouTubeResults}
                isLoading={isLoadingYouTubeResults}
            >
                {isLoadingYouTubeResults ? 'Refreshing...' : 'Refresh Validation'}
            </Button>
            <Button variant="secondary" onClick={onClose} size="md" className="!font-semibold">
                Close
            </Button>
        </footer>
      </div>
    </div>
  );
};
