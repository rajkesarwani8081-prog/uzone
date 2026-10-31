import { LearningItem, LearningSection, LearningStatus } from '../types';

export interface MasteryStats {
  masteryPercentage: number;
  understood: number;
  learning: number;
  needRevision: number;
  total: number;
}

export function calculateMasteryStats(items: LearningItem[]): MasteryStats {
  const total = items.length;
  const understood = items.filter((i) => i.status === 'Understood').length;
  const learning = items.filter((i) => i.status === 'Learning').length;
  const needRevision = items.filter((i) => i.status === 'Need Revision').length;
  const masteryPercentage = total > 0 ? Math.round((understood / total) * 100) : 0;

  return {
    masteryPercentage,
    understood,
    learning,
    needRevision,
    total,
  };
}

export function getUniqueCategories(items: LearningItem[], section?: LearningSection): string[] {
  const sectionItems = section ? items.filter((i) => i.section === section) : items;
  const categories = Array.from(
    new Set(sectionItems.map((i) => (i.category ? i.category.trim() : '')).filter(Boolean))
  );
  return categories.sort();
}

export interface FilterOptions {
  section?: LearningSection;
  search?: string;
  status?: 'All' | LearningStatus;
  category?: string;
  onlyBookmarked?: boolean;
  onlyDueRevision?: boolean;
  selectedDate?: string | null;
  todayStr?: string;
}

export function filterLearningItems(items: LearningItem[], options: FilterOptions): LearningItem[] {
  const {
    section,
    search = '',
    status = 'All',
    category = 'All',
    onlyBookmarked = false,
    onlyDueRevision = false,
    selectedDate = null,
    todayStr = new Date().toISOString().slice(0, 10),
  } = options;

  const q = search.trim().toLowerCase();

  return items.filter((item) => {
    if (section && item.section !== section) return false;
    if (status !== 'All' && item.status !== status) return false;
    if (category !== 'All' && item.category !== category) return false;
    if (onlyBookmarked && !item.bookmarked) return false;
    if (onlyDueRevision) {
      const isDue =
        item.status === 'Need Revision' ||
        (item.nextRevisionDate && item.nextRevisionDate <= todayStr);
      if (!isDue) return false;
    }
    if (selectedDate && item.date !== selectedDate) return false;

    if (q) {
      const inTitle = item.title?.toLowerCase().includes(q);
      const inDesc = item.description?.toLowerCase().includes(q);
      const inCat = item.category?.toLowerCase().includes(q);
      const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      const inProblem = item.problemTitle?.toLowerCase().includes(q);
      const inFailure = item.failureType?.toLowerCase().includes(q);
      const inCode =
        item.buggyCode?.toLowerCase().includes(q) ||
        item.correctedSolution?.toLowerCase().includes(q) ||
        item.codeSnippet?.toLowerCase().includes(q);

      if (!inTitle && !inDesc && !inCat && !inTags && !inProblem && !inFailure && !inCode) {
        return false;
      }
    }

    return true;
  });
}
