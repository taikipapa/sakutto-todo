export const ALL_KEY = '__all__';

export const DEFAULT_CATEGORIES = [
  { id: 'work', label: '仕事', color: '#4A90D9' },
  { id: 'private', label: 'プライベート', color: '#E0719C' },
  { id: 'other', label: 'その他', color: '#7E8B99' },
];

// Palette offered when creating a new category.
export const COLOR_PALETTE = [
  '#4A90D9',
  '#E0719C',
  '#7E8B99',
  '#5CB85C',
  '#F0AD4E',
  '#9B6BCE',
  '#D9534F',
  '#3DBFB8',
];

const FALLBACK_CATEGORY = { id: null, label: '不明', color: '#999999' };

export function getCategory(categories, id) {
  return categories.find((c) => c.id === id) ?? FALLBACK_CATEGORY;
}
