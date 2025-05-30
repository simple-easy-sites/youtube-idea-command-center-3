
import React from 'react';
import { VideoIdea } from '../types';
import { Button } from './ui/Button';

interface ScriptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: VideoIdea | null;
}

export const ScriptViewerModal: React.FC<ScriptViewerModalProps> = ({ isOpen, onClose, idea }) => {
  if (!isOpen || !idea ) return null;

  const { 
    text, 
    script, 
    videoInstructions, 
    suggestedResources, 
    scriptLengthMinutes,
    isScriptLoading 
  } = idea;

  const renderContent = (content: string | undefined, title: string) => {
    if (!content) return null;
    return (
      <div className="mb-6 last:mb-0 animate-fadeIn" style={{animationDelay: '0.2s'}}>
        <h3 className="text-xl font-semibold text-sky-300 mb-2.5">{title}</h3>
        <div className="whitespace-pre-wrap text-gray-200 bg-gray-800/50 p-4 rounded-lg border border-[var(--glass-border-color)] shadow-inner leading-relaxed text-sm">
          {content}
        </div>
      </div>
    );
  };

   const renderResources = (resources: string[] | undefined) => {
    if (!resources || resources.length === 0) return null;
    return (
      <div className="mb-6 animate-fadeIn" style={{animationDelay: '0.3s'}}>
        <h3 className="text-xl font-semibold text-sky-300 mb-2.5">Suggested Resources</h3>
        <ul className="list-disc list-inside pl-1 space-y-1.5 text-[var(--text-secondary)] bg-gray-800/50 p-4 rounded-lg border border-[var(--glass-border-color)] shadow-inner text-sm">
          {resources.map((resource, index) => (
            <li key={index}>
              <a href={resource} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline hover:text-sky-200">
                {resource}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };


  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="glass-card !rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl !border-sky-400/50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-5 md:p-6 border-b border-[var(--glass-border-color)] flex justify-between items-center bg-gradient-to-r from-[var(--glass-bg-main-start)] via-[var(--glass-bg-main-end)] to-[var(--glass-bg-main-start)]">
          <h2 className="text-2xl font-semibold text-sky-200 truncate pr-4" title={text}>
            Content Plan: {text.length > 40 ? text.substring(0, 37) + "..." : text} 
            {scriptLengthMinutes && <span className="text-base font-normal text-sky-400 ml-2"> (~{scriptLengthMinutes} min)</span>}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-2 text-[var(--text-secondary)] hover:text-white !rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </header>

        <main className="p-5 md:p-6 space-y-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-[var(--scrollbar-thumb)] scrollbar-track-[var(--scrollbar-track)]">
          {isScriptLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
              <svg className="animate-spin h-12 w-12 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-5 text-lg text-[var(--text-secondary)]">Generating script content...</p>
            </div>
          )}
          {!isScriptLoading && !script && !videoInstructions && !suggestedResources && (
             <p className="text-center text-[var(--text-secondary)] italic py-12 text-lg">
                No script content generated yet for this idea. Use the 'Generate Script' option on the idea card.
            </p>
          )}
          
          {renderContent(script, `Video Script (~${scriptLengthMinutes || 'N/A'} min)`)}
          {renderContent(videoInstructions, "Video Production Instructions")}
          {renderResources(suggestedResources)}
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
