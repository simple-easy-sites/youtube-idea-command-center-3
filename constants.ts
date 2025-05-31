import { IdeaStatus, IdeaPriority, NicheDefinition, USER_DEFINED_NICHES, TutorialType } from './types';

export const STATUS_OPTIONS = Object.values(IdeaStatus).map(status => ({ value: status, label: status }));
export const PRIORITY_OPTIONS = [
  { value: IdeaPriority.LOW, label: 'Low' },
  { value: IdeaPriority.MEDIUM, label: 'Medium' },
  { value: IdeaPriority.HIGH, label: 'High' },
];

// Generate NICHES_FOR_DROPDOWN from the new flat USER_DEFINED_NICHES structure
export const NICHES_FOR_DROPDOWN = USER_DEFINED_NICHES.map(niche => ({
  value: niche.name, // Use the user-facing name as the value
  label: niche.name,
})).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

// Helper function to get niche details (including examples) by its name from USER_DEFINED_NICHES
export const getNicheDetailsByName = (nicheName: string): NicheDefinition | undefined => {
  return USER_DEFINED_NICHES.find(niche => niche.name === nicheName);
};

export const TUTORIAL_TYPE_OPTIONS = Object.values(TutorialType).map(type => ({
  value: type,
  label: type,
})).sort((a,b) => a.label.localeCompare(b.label));


export const STATUS_COLORS: Record<IdeaStatus, string> = {
  [IdeaStatus.NEW]: 'cyan-400',
  [IdeaStatus.PRIORITIZED]: 'yellow-400', 
  [IdeaStatus.IN_PROGRESS]: 'purple-500',
  [IdeaStatus.VIDEO_MADE]: 'emerald-500',
  [IdeaStatus.DISCARDED]: 'rose-500',
};

export const STATUS_BORDER_CLASSES: Record<IdeaStatus, string> = {
  [IdeaStatus.NEW]: 'status-new-border',
  [IdeaStatus.PRIORITIZED]: 'status-prioritized-border', 
  [IdeaStatus.IN_PROGRESS]: 'status-in-progress-border',
  [IdeaStatus.VIDEO_MADE]: 'status-video-made-border',
  [IdeaStatus.DISCARDED]: 'status-discarded-border',
};