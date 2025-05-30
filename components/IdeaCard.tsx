

import React, { useState } from 'react';
import { VideoIdea, IdeaStatus, IdeaPriority, GroundingChunk, TitleSuggestion, UntappedScore } from '../types';
import { PRIORITY_OPTIONS, STATUS_BORDER_CLASSES } from '../constants';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CollapsibleSection } from './ui/CollapsibleSection';

interface IdeaCardProps {
  idea: VideoIdea;
  onUpdateIdea: (id: string, updates: Partial<VideoIdea>) => void;
  onDeleteIdea: (id: string) => void;
  onGenerateKeywords: (ideaId: string) => Promise<void>;
  onGenerateScriptAndInstructions: (ideaId: string, lengthMinutes: number) => Promise<void>;
  onExpandIdea: (ideaId: string) => Promise<void>;
  onShowScriptModal: (ideaId: string) => void;
  onShowYouTubeValidation: (ideaId: string, forceRefresh?: boolean) => void; 
  onGenerateTitleSuggestions: (ideaId: string) => Promise<void>; 
  isLoadingScriptGlobal?: boolean; 
  isLoadingExpansionGlobal?: boolean;
}

const TimeAgo: React.FC<{ dateString: string }> = ({ dateString }) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return <>{seconds}s ago</>;
  if (minutes < 60) return <>{minutes}m ago</>;
  if (hours < 24) return <>{hours}h ago</>;
  return <>{days}d ago</>;
};

const IconBase: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-[22px] h-[22px] mr-2.5 ${className}`}> 
    {children}
  </svg>
);

const ScriptIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0_12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></IconBase>;
const ExpandIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></IconBase>;
const YouTubeIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25v-4.5zm3.75 0l3 2.25-3 2.25v-4.5zm3.75 0l3 2.25-3 2.25v-4.5z M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5z" /></IconBase>;
const KeywordIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.75m-5.25 0V3.888c-.055-.194-.084-.4-.084-.612m0 0A2.25 2.25 0 005.25 2.25h-3A2.25 2.25 0 000 4.5v15A2.25 2.25 0 002.25 21.75h19.5A2.25 2.25 0 0024 19.5V4.5A2.25 2.25 0 0021.75 2.25h-3.375c-.69 0-1.307.348-1.688.934L15.666 3.888zM12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" /></IconBase>;
const TitleOptimizeIcon = () => <IconBase><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></IconBase>;
const RationaleIcon = () => <IconBase className="!mr-1.5 !w-5 !h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.996 15.996 0 01-4.5 0m4.5 0v1.875m0 0H12.75m0 0h1.5m-1.5 0p-3.75 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></IconBase>;


const UntappedScoreBadge: React.FC<{ score?: UntappedScore, summary?: string }> = ({ score, summary }) => {
  if (!score || score === 'Not Assessed') return null;

  let colorClasses = '';
  let text = `Untapped: ${score}`;
  switch (score) {
    case 'High': colorClasses = 'bg-emerald-600/30 text-emerald-200 border-emerald-500/60'; break;
    case 'Medium': colorClasses = 'bg-yellow-600/30 text-yellow-200 border-yellow-500/60'; break;
    case 'Low': colorClasses = 'bg-orange-600/30 text-orange-200 border-orange-500/60'; break;
    case 'Error': 
      colorClasses = 'bg-red-600/30 text-red-200 border-red-500/60'; 
      text = `Validation: ${score}`;
      break;
    default: return null;
  }

  return (
    <div className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${colorClasses} inline-block my-2 glass-card-subtle shadow-md`} title={summary}>
      {text}
      {summary && score !== 'Error' && <p className="text-xs font-normal opacity-80 truncate mt-0.5" style={{maxWidth: '200px'}}>{summary}</p>}
    </div>
  );
};

export const IdeaCard: React.FC<IdeaCardProps> = ({ 
    idea, 
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
  
  const [targetScriptLength, setTargetScriptLength] = useState<number>(idea.scriptLengthMinutes || 4);
  const [isGeneratingScriptForThisCard, setIsGeneratingScriptForThisCard] = useState(false);
  const [isExpandingForThisCard, setIsExpandingForThisCard] = useState(false);
  const [isResearchingKeywordsForThisCard, setIsResearchingKeywordsForThisCard] = useState(false);
  const [isOptimizingTitleForThisCard, setIsOptimizingTitleForThisCard] = useState(false);

  const handleStatusChange = (newStatus: IdeaStatus) => {
    onUpdateIdea(idea.id, { status: newStatus });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateIdea(idea.id, { priority: parseInt(e.target.value) as IdeaPriority });
  };

  const handleGenerateKeywordsClick = async () => {
    setIsResearchingKeywordsForThisCard(true);
    await onGenerateKeywords(idea.id);
    setIsResearchingKeywordsForThisCard(false);
  };
  
  const handleGenerateTitleSuggestionsClick = async () => {
    setIsOptimizingTitleForThisCard(true);
    await onGenerateTitleSuggestions(idea.id);
    setIsOptimizingTitleForThisCard(false);
  };

  const handleGenerateScriptClick = async () => {
    setIsGeneratingScriptForThisCard(true);
    await onGenerateScriptAndInstructions(idea.id, targetScriptLength);
    setIsGeneratingScriptForThisCard(false);
  };

  const handleExpandIdeaClick = async () => {
    setIsExpandingForThisCard(true);
    await onExpandIdea(idea.id);
    setIsExpandingForThisCard(false);
  };
  
  const cardBorderClass = STATUS_BORDER_CLASSES[idea.status] || 'border-l-[var(--glass-border-color)]';
  const isHighPriorityNonTerminal = idea.priority === IdeaPriority.HIGH && idea.status !== IdeaStatus.VIDEO_MADE && idea.status !== IdeaStatus.DISCARDED;
  
  const isPrioritized = idea.status === IdeaStatus.PRIORITIZED; // AI tools primarily for prioritized ideas

  const isAnyActionLoading = idea.isScriptLoading || idea.isExpanding || idea.isKeywordsLoading || idea.isTitleOptimizing ||
                             isGeneratingScriptForThisCard || isExpandingForThisCard || isResearchingKeywordsForThisCard || isOptimizingTitleForThisCard ||
                             !!isLoadingScriptGlobal || !!isLoadingExpansionGlobal;
  
  const detailTextColor = "text-[var(--text-secondary)]";
  const labelTextColor = "text-[var(--text-tertiary)]";

  const renderStatusButtons = () => {
    const buttonBaseClass = "w-full !font-medium !text-sm !py-2";
    switch (idea.status) {
      case IdeaStatus.NEW:
        return (
          <Button onClick={() => handleStatusChange(IdeaStatus.PRIORITIZED)} variant="primary" className={`${buttonBaseClass} !bg-yellow-500/80 hover:!bg-yellow-500/100 !border-yellow-600 hover:!border-yellow-400`}>
            Prioritize Idea
          </Button>
        );
      case IdeaStatus.PRIORITIZED:
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleStatusChange(IdeaStatus.IN_PROGRESS)} variant="primary" className={`${buttonBaseClass} !bg-purple-500/80 hover:!bg-purple-500/100 !border-purple-600 hover:!border-purple-400`}>
              Start Progress
            </Button>
            <Button onClick={() => handleStatusChange(IdeaStatus.VIDEO_MADE)} variant="secondary" className={`${buttonBaseClass} !bg-emerald-500/80 hover:!bg-emerald-500/100 !border-emerald-600 hover:!border-emerald-400`}>
              Video Made
            </Button>
          </div>
        );
      case IdeaStatus.IN_PROGRESS:
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleStatusChange(IdeaStatus.VIDEO_MADE)} variant="primary" className={`${buttonBaseClass} !bg-emerald-500/80 hover:!bg-emerald-500/100 !border-emerald-600 hover:!border-emerald-400`}>
              Mark as Video Made
            </Button>
            <Button onClick={() => handleStatusChange(IdeaStatus.PRIORITIZED)} variant="secondary" className={`${buttonBaseClass} !bg-yellow-500/80 hover:!bg-yellow-500/100 !border-yellow-600 hover:!border-yellow-400`}>
              Back to Prioritized
            </Button>
          </div>
        );
      case IdeaStatus.VIDEO_MADE:
        return (
           <Button onClick={() => handleStatusChange(IdeaStatus.PRIORITIZED)} variant="secondary" className={`${buttonBaseClass} !bg-sky-500/80 hover:!bg-sky-500/100 !border-sky-600 hover:!border-sky-400`}>
            Re-Prioritize (e.g., for V2)
          </Button>
        );
      default:
        return null;
    }
  };


  return (
    <div 
      className={`glass-card p-5 md:p-6 flex flex-col justify-between space-y-5 border-l-[6px] ${cardBorderClass} ${isHighPriorityNonTerminal ? 'priority-high-glow' : ''} transition-all duration-300 animate-fadeIn`}
    >
      <div>
        <h3 className={`text-lg font-semibold leading-tight mb-1.5 ${isHighPriorityNonTerminal ? 'text-yellow-200 filter drop-shadow(0 0 5px var(--priority-glow-soft))' : 'text-[var(--text-primary)]'}`}>{idea.text}</h3>
        
        {idea.aiRationale && (
            <div className="my-2.5 p-3 bg-sky-800/20 border border-sky-700/40 rounded-lg glass-card-subtle shadow-sm">
                <p className="text-xs text-sky-300 flex items-start">
                    <RationaleIcon /> 
                    <span className="font-semibold mr-1.5">AI Rationale:</span> 
                    <span className="italic opacity-90">{idea.aiRationale}</span>
                </p>
            </div>
        )}

        {(idea.untappedScore && idea.untappedScore !== 'Not Assessed') ? (
            <UntappedScoreBadge score={idea.untappedScore} summary={idea.validationSummary} />
        ) : idea.validationSummary && idea.validationSummary !== 'Validating...' && ( // Show summary if validation failed or pending
            <p className="text-xs text-orange-300/80 my-2 italic truncate" title={idea.validationSummary}>
                YT Validation: {idea.validationSummary}
            </p>
        )}

        <div className="text-xs space-y-1.5 mt-2"> 
          <p><strong className={`font-medium ${labelTextColor}`}>Niche:</strong> <span className={detailTextColor}>{idea.niche}</span></p>
          <p><strong className={`font-medium ${labelTextColor}`}>App/Software:</strong> <span className={detailTextColor}>{idea.appSoftware}</span></p>
          <p><strong className={`font-medium ${labelTextColor}`}>Source:</strong> <span className={detailTextColor}>{idea.source}</span></p>
          <p><strong className={`font-medium ${labelTextColor}`}>Created:</strong> <span className={detailTextColor}><TimeAgo dateString={idea.createdAt} /></span></p>
          <p><strong className={`font-medium ${labelTextColor}`}>Updated:</strong> <span className={detailTextColor}><TimeAgo dateString={idea.lastUpdatedAt} /></span></p>
        </div>
      </div>

      <div className="space-y-3.5"> 
        {idea.status !== IdeaStatus.DISCARDED && renderStatusButtons()}
        <Select
          label="Priority"
          id={`priority-${idea.id}`}
          options={PRIORITY_OPTIONS}
          value={idea.priority.toString()}
          onChange={handlePriorityChange}
          className="!text-sm !py-2.5 !bg-opacity-70"
        />
      </div>

      {isPrioritized && (
        <div className="pt-4 border-t border-[var(--glass-border-color)] space-y-3.5"> 
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateTitleSuggestionsClick}
            isLoading={isOptimizingTitleForThisCard || idea.isTitleOptimizing}
            disabled={isAnyActionLoading}
            className="w-full !font-medium !tracking-wide" 
          >
            <TitleOptimizeIcon /> Optimize Title
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateKeywordsClick}
            isLoading={isResearchingKeywordsForThisCard || idea.isKeywordsLoading}
            disabled={isAnyActionLoading}
            className="w-full !font-medium !tracking-wide"
          >
            <KeywordIcon /> Research Keywords
          </Button>
          <div className="flex items-end space-x-3"> 
            <Input
              label="Video Length (min)"
              id={`length-${idea.id}`}
              type="number"
              min="1"
              max="60"
              value={targetScriptLength.toString()}
              onChange={(e) => setTargetScriptLength(parseInt(e.target.value) || 4)}
              containerClassName="flex-grow"
              className="!text-sm !py-2.5 !bg-opacity-70"
              disabled={isAnyActionLoading}
            />
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleGenerateScriptClick}
              isLoading={isGeneratingScriptForThisCard || idea.isScriptLoading}
              disabled={isAnyActionLoading}
              className="whitespace-nowrap !px-4 !py-[0.69rem] !font-medium !tracking-wide" 
            >
              <ScriptIcon /> Generate Script
            </Button>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleExpandIdeaClick}
            isLoading={isExpandingForThisCard || idea.isExpanding}
            disabled={isAnyActionLoading}
            className="w-full !font-medium !tracking-wide"
          >
            <ExpandIcon /> Expand Ideas
          </Button>
        </div>
      )}
      
      {(idea.script || (idea.suggestedKeywords && idea.suggestedKeywords.length > 0) || (idea.titleSuggestions && idea.titleSuggestions.length > 0) ) && ( 
        <div className={`mt-1.5 ${isPrioritized && !idea.script && (!idea.titleSuggestions || idea.titleSuggestions.length === 0) ? 'pt-0' : 'pt-4 border-t border-[var(--glass-border-color)]'}`}>
          <Button
            variant="ghost" 
            size="sm"
            onClick={() => onShowScriptModal(idea.id)}
            className="w-full !font-medium text-sky-300 border-sky-500/50 hover:bg-sky-700/40 hover:text-sky-200 hover:border-sky-500/70 !tracking-wide"
          >
            <ScriptIcon /> View Full Content Plan
          </Button>
        </div>
      )}

      <div className="mt-1.5">
         <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onShowYouTubeValidation(idea.id)}
            isLoading={idea.isYouTubeLoading}
            disabled={idea.isYouTubeLoading || isAnyActionLoading}
            className="w-full !font-medium text-blue-400 border-blue-500/50 hover:bg-blue-700/40 hover:text-blue-300 hover:border-blue-500/70 !tracking-wide"
          >
           <YouTubeIcon/> 
           {idea.youtubeResults && idea.youtubeResults.length > 0 && idea.untappedScore !== 'Not Assessed' ? 'Re-validate & View Details' : 'Validate on YouTube'}
          </Button>
      </div>

      {[
        { condition: idea.titleSuggestions && idea.titleSuggestions.length > 0, title: "Optimized Title Suggestions", data: idea.titleSuggestions, render: (s: TitleSuggestion) => <li key={s.suggestedTitle} className="border-b border-[var(--glass-border-color)] pb-2.5 mb-2.5 last:border-b-0 last:pb-0 last:mb-0 interactive-list-item p-2"><strong className="text-purple-300 block text-sm">{s.suggestedTitle}</strong><p className="text-[var(--text-tertiary)] italic mt-1 text-xs">{s.rationale}</p></li> },
        { condition: idea.suggestedKeywords && idea.suggestedKeywords.length > 0, title: "Suggested Keywords", data: idea.suggestedKeywords, render: (k: string, i: number) => <li key={i} className="text-sm interactive-list-item p-1">{k}</li>, groundingChunks: idea.keywordSearchGroundingChunks },
        { condition: idea.script, title: "Generated Script Snippet", data: idea.script ? idea.script.substring(0, 300) + (idea.script.length > 300 ? "..." : "") : "", type: 'pre' },
        { condition: idea.expandedIdeas && idea.expandedIdeas.length > 0, title: "Expanded Idea Titles", data: idea.expandedIdeas, render: (ei: string, i: number) => <li key={i} className="text-sm interactive-list-item p-1">{ei}</li> },
      ].map(section => section.condition && (
        <CollapsibleSection 
            key={section.title} 
            title={section.title} 
            headerClassName="!text-sm !font-medium !py-3 !px-4 !bg-opacity-60" 
            contentClassName="!pt-3 !pb-4 !px-4 !bg-opacity-40"
            className="!border-opacity-50 !rounded-lg" 
        >
          {section.type === 'pre' ? (
            <pre className="whitespace-pre-wrap text-xs text-[var(--text-secondary)] bg-black/20 p-3.5 rounded-md max-h-48 overflow-y-auto border border-[var(--glass-border-color)] shadow-inner">{section.data as string}</pre>
          ) : (
            <ul className={`${section.title === "Suggested Keywords" || section.title === "Expanded Idea Titles" ? 'list-disc list-inside pl-1' : ''} space-y-1.5 text-[var(--text-secondary)] bg-black/20 p-3.5 rounded-md max-h-40 overflow-y-auto border border-[var(--glass-border-color)] shadow-inner`}>
              {(section.data as any[]).map(section.render!)}
            </ul>
          )}
          {section.title === "Suggested Keywords" && section.groundingChunks && section.groundingChunks.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[var(--glass-border-color)]">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1.5">Sources (Google Search):</p>
              <ul className="list-decimal list-inside text-xs text-[var(--text-secondary)] space-y-1 max-h-32 overflow-y-auto bg-black/10 p-2.5 rounded-md border border-[var(--glass-border-color)]">
                {section.groundingChunks.map((chunk, index) => (
                  chunk.web && (
                    <li key={index} className="truncate interactive-list-item p-0.5">
                      <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline hover:text-sky-300" title={chunk.web.uri}>
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    </li>
                  )
                ))}
              </ul>
            </div>
          )}
        </CollapsibleSection>
      ))}

      {idea.status !== IdeaStatus.DISCARDED && (
        <div className="mt-4 pt-4 border-t border-[var(--glass-border-color)]">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDeleteIdea(idea.id)} 
            className="w-full !font-medium text-red-400 border-red-500/50 hover:bg-red-700/50 hover:text-red-300 hover:border-red-500/70 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] !tracking-wide"
            id="discard-button"
            disabled={isAnyActionLoading}
          >
            Discard Idea
          </Button>
        </div>
      )}
    </div>
  );
};