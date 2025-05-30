
import React from 'react';
import { VideoIdea, TitleSuggestion } from '../types';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface TitleOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: VideoIdea | null;
  onApplyTitle: (newTitle: string) => void;
  isOptimizing: boolean;
}

export const TitleOptimizerModal: React.FC<TitleOptimizerModalProps> = ({ 
  isOpen, 
  onClose, 
  idea, 
  onApplyTitle,
  isOptimizing
}) => {
  if (!isOpen || !idea) return null;

  const isLoading = isOptimizing || idea.isTitleOptimizing;

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="glass-card !rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl !border-purple-400/50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 md:p-6 border-b border-[var(--glass-border-color)] flex justify-between items-center bg-gradient-to-r from-[var(--glass-bg-main-start)] via-[var(--glass-bg-main-end)] to-[var(--glass-bg-main-start)]">
          <h2 className="text-2xl font-semibold text-purple-300">
            Optimize Title
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-2 text-[var(--text-secondary)] hover:text-white !rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </header>

        <main className="p-5 md:p-6 space-y-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px]"> {/* Increased min-h */}
              <LoadingSpinner size="lg" color="text-purple-400" />
              <p className="mt-5 text-lg text-[var(--text-secondary)]">Optimizing title, please wait...</p>
            </div>
          ) : (
            <>
              <div className="animate-fadeIn" style={{animationDelay: '0.1s'}}>
                <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-2">Original Title:</h3>
                <p className="text-md text-[var(--text-primary)] glass-card-subtle p-4 rounded-lg border border-[var(--glass-border-color)] shadow-inner">{idea.text}</p>
              </div>

              {idea.titleSuggestions && idea.titleSuggestions.length > 0 ? (
                <div className="animate-fadeIn" style={{animationDelay: '0.2s'}}>
                  <h3 className="text-xl font-semibold text-purple-300 mb-3.5">AI Suggested Titles:</h3>
                  <div className="space-y-5"> {/* Increased spacing */}
                    {idea.titleSuggestions.map((suggestion, index) => (
                      <div key={index} className="glass-card-subtle p-4 rounded-lg border border-[var(--glass-border-color)] shadow-md interactive-list-item animate-fadeIn" style={{animationDelay: `${0.3 + index * 0.07}s`}}>
                        <p className="text-md font-semibold text-purple-200 mb-2">{suggestion.suggestedTitle}</p>
                        <p className="text-sm text-[var(--text-secondary)] italic mb-4">{suggestion.rationale}</p>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => onApplyTitle(suggestion.suggestedTitle)}
                          className="w-full sm:w-auto !font-semibold !tracking-wide"
                        >
                          Apply This Title
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                 <p className="text-center text-[var(--text-secondary)] italic py-10 text-lg animate-fadeIn" style={{animationDelay: '0.2s'}}>
                  No title suggestions were generated, or an error occurred.
                </p>
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