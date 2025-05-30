import { IdeaStatus, IdeaPriority, HIGH_RPM_NICHES as NICHES_DATA } from './types';

export const STATUS_OPTIONS = Object.values(IdeaStatus).map(status => ({ value: status, label: status }));
export const PRIORITY_OPTIONS = [
  { value: IdeaPriority.LOW, label: 'Low' },
  { value: IdeaPriority.MEDIUM, label: 'Medium' },
  { value: IdeaPriority.HIGH, label: 'High' },
];

export const NICHES_FOR_DROPDOWN = NICHES_DATA.map(nicheInfo => ({ value: nicheInfo.name, label: nicheInfo.label }));

export const STATUS_COLORS: Record<IdeaStatus, string> = {
  [IdeaStatus.NEW]: 'cyan-400',
  [IdeaStatus.PRIORITIZED]: 'yellow-400', // Kept for text, border glow is CSS
  [IdeaStatus.IN_PROGRESS]: 'purple-500',
  [IdeaStatus.VIDEO_MADE]: 'emerald-500',
  // [IdeaStatus.ARCHIVED]: 'gray-500', // Removed color for Archived
  [IdeaStatus.DISCARDED]: 'rose-500',
};

export const STATUS_BORDER_CLASSES: Record<IdeaStatus, string> = {
  [IdeaStatus.NEW]: 'status-new-border',
  [IdeaStatus.PRIORITIZED]: 'status-prioritized-border', // This will use #FFD700 from CSS
  [IdeaStatus.IN_PROGRESS]: 'status-in-progress-border',
  [IdeaStatus.VIDEO_MADE]: 'status-video-made-border',
  // [IdeaStatus.ARCHIVED]: 'status-archived-border', // Removed border class for Archived
  [IdeaStatus.DISCARDED]: 'status-discarded-border',
};