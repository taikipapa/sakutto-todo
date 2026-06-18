import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { DEFAULT_NOTIFICATION_SETTINGS } from '../constants/notifications';

const TASKS_KEY = '@todoapp/tasks';
const CATEGORIES_KEY = '@todoapp/categories';
const TRASH_KEY = '@todoapp/trash';
const NOTIFICATION_SETTINGS_KEY = '@todoapp/notificationSettings';
const TASK_COMPLETION_COUNT_KEY = '@todoapp/taskCompletionCount';
const LAST_INTERSTITIAL_SHOWN_AT_KEY = '@todoapp/lastInterstitialShownAt';
const CATEGORY_LIMIT_BONUS_KEY = '@todoapp/categoryLimitBonus';

async function loadJson(key, fallback) {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : fallback;
  } catch (e) {
    console.warn(`${key} の読み込みに失敗しました`, e);
    return fallback;
  }
}

async function saveJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`${key} の保存に失敗しました`, e);
  }
}

export const loadTasks = () => loadJson(TASKS_KEY, []);
export const saveTasks = (tasks) => saveJson(TASKS_KEY, tasks);

export const loadCategories = () => loadJson(CATEGORIES_KEY, DEFAULT_CATEGORIES);
export const saveCategories = (categories) => saveJson(CATEGORIES_KEY, categories);

export const loadTrash = () => loadJson(TRASH_KEY, []);
export const saveTrash = (trash) => saveJson(TRASH_KEY, trash);

export const loadNotificationSettings = () =>
  loadJson(NOTIFICATION_SETTINGS_KEY, DEFAULT_NOTIFICATION_SETTINGS);
export const saveNotificationSettings = (settings) =>
  saveJson(NOTIFICATION_SETTINGS_KEY, settings);

export const loadTaskCompletionCount = () => loadJson(TASK_COMPLETION_COUNT_KEY, 0);
export const saveTaskCompletionCount = (count) => saveJson(TASK_COMPLETION_COUNT_KEY, count);

export const loadLastInterstitialShownAt = () => loadJson(LAST_INTERSTITIAL_SHOWN_AT_KEY, 0);
export const saveLastInterstitialShownAt = (timestamp) =>
  saveJson(LAST_INTERSTITIAL_SHOWN_AT_KEY, timestamp);

export const loadCategoryLimitBonus = () => loadJson(CATEGORY_LIMIT_BONUS_KEY, 0);
export const saveCategoryLimitBonus = (bonus) => saveJson(CATEGORY_LIMIT_BONUS_KEY, bonus);
