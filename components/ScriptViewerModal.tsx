

import React from 'react';
import { VideoIdea } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Button } from './ui/Button';

interface ScriptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: VideoIdea | null;
}

export const ScriptViewerModal: React.FC<ScriptViewerModalProps> = ({ isOpen, onClose, idea }) => {
  if (!isOpen || !idea) return null;

  const isLoadingScript = idea?.isScriptLoading ?? false;
  const isLoadingKeywords = idea?.isKeywordsLoading ?? false; 
  const isLoadingTitles = idea?.isTitleOptimizing ?? false; 

  const anyLoading = isLoadingScript || isLoadingKeywords || isLoadingTitles;

  const sectionBaseClass = "glass-card-subtle p-4 md:p-5 rounded-lg border border-[var(--glass-border-color)] shadow-inner"; // Using subtle glass for sections
  const listBaseClass = "space-y-2 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]";
  const preBaseClass = "whitespace-pre-wrap text-sm text-[var(--text-primary)] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]"; // Increased max-h for script

  const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <h3 className={`text-xl font-semibold mb-3 ${className}`}>{children}</h3>
  );


  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn" // Increased blur
      onClick={onClose}
    >
      <div 
        className="glass-card !rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl !border-sky-500/50" 
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 md:p-6 border-b border-[var(--glass-border-color)] flex justify-between items-center bg-gradient-to-r from-[var(--glass-bg-main-start)] via-[var(--glass-bg-main-end)] to-[var(--glass-bg-main-start)]">
          <h2 className="text-2xl font-semibold text-sky-300 truncate pr-4" title={idea.text}>
            Content Plan: {idea.text.length > 55 ? idea.text.substring(0, 52) + '...' : idea.text}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-2 text-[var(--text-secondary)] hover:text-white !rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </header>

        <main className="p-5 md:p-6 space-y-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]">
          {anyLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <LoadingSpinner size="lg" color="text-sky-400" />
              <p className="mt-5 text-lg text-[var(--text-secondary)]">
                {isLoadingScript ? "Generating script..." : isLoadingKeywords ? "Researching keywords..." : "Optimizing title..."}
              </p>
            </div>
          ) : (
            <>
              {idea.titleSuggestions && idea.titleSuggestions.length > 0 && (
                 <div className="animate-fadeIn" style={{animationDelay: '0.1s'}}>
                  <SectionTitle className="text-pink-400">Optimized Title Suggestions</SectionTitle>
                  <ul className={`${sectionBaseClass} ${listBaseClass} !max-h-60 space-y-3.5`}>
                    {idea.titleSuggestions.map((suggestion, index) => (
                      <li key={index} className="border-b border-[var(--glass-border-color)] pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0 interactive-list-item !px-2 !py-1 rounded-lg">
                        <strong className="text-pink-300 block text-md">{suggestion.suggestedTitle}</strong>
                        <p className="text-[var(--text-secondary)] italic mt-1.5 text-sm">{suggestion.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {idea.suggestedKeywords && idea.suggestedKeywords.length > 0 && (
                <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
                  <SectionTitle className="text-purple-400">Suggested Keywords</SectionTitle>
                  <ul className={`list-disc list-inside text-md text-[var(--text-primary)] ${sectionBaseClass} ${listBaseClass}`}>
                    {idea.suggestedKeywords.map((keyword, index) => (
                      <li key={index} className="interactive-list-item !px-2 !py-1 rounded-lg ml-1">{keyword}</li>
                    ))}
                  </ul>
                  {idea.keywordSearchGroundingChunks && idea.keywordSearchGroundingChunks.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-lg font-semibold text-purple-300 mb-2">Keyword Research Sources (Google Search):</h4>
                      <ul className={`list-decimal list-inside text-sm text-[var(--text-secondary)] ${sectionBaseClass} !py-3.5 ${listBaseClass} !max-h-44`}>
                        {idea.keywordSearchGroundingChunks.map((chunk, index) => (
                          chunk.web && (
                            <li key={index} className="truncate interactive-list-item !px-2 !py-1 rounded-lg ml-1">
                              <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline hover:text-sky-300 transition-colors" title={chunk.web.uri}>
                                {chunk.web.title || chunk.web.uri}
                              </a>
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="animate-fadeIn" style={{animationDelay: '0.3s'}}>
                <SectionTitle className="text-sky-400">Video Script (~{idea.scriptLengthMinutes || 'N/A'} min)</SectionTitle>
                <pre className={`${sectionBaseClass} ${preBaseClass} leading-relaxed`}> {/* Added leading-relaxed */}
                  {idea.script || "No script generated yet, or script generation failed."}
                </pre>
              </div>

              <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
                <SectionTitle className="text-teal-400">Production Instructions</SectionTitle>
                <pre className={`${sectionBaseClass} ${preBaseClass} leading-relaxed`}>
                  {idea.videoInstructions || "No instructions generated yet."}
                </pre>
              </div>

              {idea.suggestedResources && idea.suggestedResources.length > 0 && (
                <div className="animate-fadeIn" style={{animationDelay: '0.5s'}}>
                  <SectionTitle className="text-indigo-400">Suggested Script Resources</SectionTitle>
                  <ul className={`list-disc list-inside text-md text-[var(--text-primary)] ${sectionBaseClass} ${listBaseClass} !max-h-64`}>
                    {idea.suggestedResources.map((res, index) => (
                      <li key={index} className="interactive-list-item !px-2 !py-1 rounded-lg ml-1">
                        {res.startsWith('http') ? (
                          <a href={res} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline hover:text-sky-300 transition-colors">
                            {res}
                          </a>
                        ) : (
                          res
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </main>
        <footer className="p-4 md:p-5 border-t border-[var(--glass-border-color)] text-right bg-gradient-to-r from-[var(--glass-bg-main-end)] via-[var(--glass-bg-subtle-start)] to-[var(--glass-bg-main-end)]">
            <Button variant="secondary" onClick={onClose} size="md" className="!font-semibold">
                Close
            </Button>
        </footer>
      </div>
    </div>
  );
};