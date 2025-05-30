

import React from 'react';
import { VideoIdea, IdeaStatus } from '../types';
import { IdeaCard } from './IdeaCard';
import { CollapsibleSection } from './ui/CollapsibleSection';

interface IdeaSectionProps {
  title: string;
  ideas: VideoIdea[];
  status: IdeaStatus; 
  onUpdateIdea: (id: string, updates: Partial<VideoIdea>) => void;
  onDeleteIdea: (id: string) => void;
  onGenerateKeywords: (ideaId: string) => Promise<void>; 
  onGenerateScriptAndInstructions: (ideaId: string, lengthMinutes: number) => Promise<void>;
  onExpandIdea: (ideaId: string) => Promise<void>;
  onShowScriptModal: (ideaId: string) => void;
  onShowYouTubeValidation: (ideaId: string, forceRefresh?: boolean) => void; // Updated signature
  onGenerateTitleSuggestions: (ideaId: string) => Promise<void>; // New prop
  isLoadingScriptGlobal?: boolean;
  isLoadingExpansionGlobal?: boolean;
}

export const IdeaSection: React.FC<IdeaSectionProps> = ({ 
  title, 
  ideas, 
  status, 
  onUpdateIdea, 
  onDeleteIdea,
  onGenerateKeywords,
  onGenerateScriptAndInstructions,
  onExpandIdea,
  onShowScriptModal,
  onShowYouTubeValidation,
  onGenerateTitleSuggestions, 
  isLoadingScriptGlobal,
  isLoadingExpansionGlobal
}) => {
  const defaultOpen = status === IdeaStatus.NEW || status === IdeaStatus.PRIORITIZED || (ideas.length > 0 && (status === IdeaStatus.IN_PROGRESS));
  
  if (ideas.length === 0 && (status === IdeaStatus.VIDEO_MADE || status === IdeaStatus.DISCARDED)) {
    return null;
  }

  const sectionIsEmpty = ideas.length === 0;

  return (
    <CollapsibleSection 
      title={title} 
      defaultOpen={defaultOpen} 
      className={`bg-gray-800/10 ${sectionIsEmpty ? 'border-dashed border-gray-700/50' : ''}`}
      headerClassName={sectionIsEmpty ? '!font-normal !text-gray-400' : ''}
    >
      {sectionIsEmpty ? (
        <p className="text-gray-400 italic p-4 text-center">No ideas in this section yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {ideas.map(idea => (
            <IdeaCard 
              key={idea.id} 
              idea={idea} 
              onUpdateIdea={onUpdateIdea} 
              onDeleteIdea={onDeleteIdea}
              onGenerateKeywords={onGenerateKeywords}
              onGenerateScriptAndInstructions={onGenerateScriptAndInstructions}
              onExpandIdea={onExpandIdea}
              onShowScriptModal={onShowScriptModal}
              onShowYouTubeValidation={onShowYouTubeValidation} // Pass through
              onGenerateTitleSuggestions={onGenerateTitleSuggestions} 
              isLoadingScriptGlobal={isLoadingScriptGlobal}
              isLoadingExpansionGlobal={isLoadingExpansionGlobal}
            />
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
};