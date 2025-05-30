import { IdeaStatus, IdeaPriority, NEW_HIGH_RPM_CATEGORIES, HighRpmNicheDetail } from './types';

export const STATUS_OPTIONS = Object.values(IdeaStatus).map(status => ({ value: status, label: status }));
export const PRIORITY_OPTIONS = [
  { value: IdeaPriority.LOW, label: 'Low' },
  { value: IdeaPriority.MEDIUM, label: 'Medium' },
  { value: IdeaPriority.HIGH, label: 'High' },
];

// Generate NICHES_FOR_DROPDOWN from the new categorized structure
// Each option will have a value (niche name) and a label (niche name).
// We can also consider adding optgroups in the Select component later if needed.
export const NICHES_FOR_DROPDOWN = NEW_HIGH_RPM_CATEGORIES.flatMap(category => 
  category.niches.map(niche => ({
    value: niche.name,
    label: niche.name, // For now, label is same as name. Can be category.categoryName + " - " + niche.name if too many duplicates
    group: category.categoryName // For potential optgroup usage
  }))
).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

// Helper function to get niche details by its name
export const getNicheDetailsByName = (nicheName: string): HighRpmNicheDetail | undefined => {
  for (const category of NEW_HIGH_RPM_CATEGORIES) {
    const foundNiche = category.niches.find(niche => niche.name === nicheName);
    if (foundNiche) {
      return foundNiche;
    }
  }
  return undefined;
};

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
