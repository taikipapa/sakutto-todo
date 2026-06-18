import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { isSameDay } from './date';

const ACHIEVEMENT_ID = 'todoapp-achievement-reminder';
const APP_NOT_OPENED_ID = 'todoapp-app-not-opened-reminder';
const APP_NOT_OPENED_INTERVAL_SECONDS = 60 * 60 * 24;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function hasPermission() {
  const status = await Notifications.getPermissionsAsync();
  return !!status.granted;
}

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'デフォルト',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  if (await hasPermission()) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return !!requested.granted;
}

export function getNextOccurrence(hour, minute, now = new Date()) {
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
}

function countCompletedOnDayBefore(tasks, fireDate) {
  const dayBefore = new Date(fireDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  return tasks.filter((t) => t.completed && isSameDay(t.completedAt, dayBefore)).length;
}

async function scheduleAchievementNotification(tasks, hour, minute) {
  await Notifications.cancelScheduledNotificationAsync(ACHIEVEMENT_ID).catch(() => {});
  const fireDate = getNextOccurrence(hour, minute);
  const count = countCompletedOnDayBefore(tasks, fireDate);
  const title =
    count > 0 ? `昨日は${count}件のタスクを達成しました！` : '昨日は完了したタスクがありませんでした';
  const body = count > 0 ? '今日もサクッと片付けましょう。' : '今日はがんばりましょう！';
  await Notifications.scheduleNotificationAsync({
    identifier: ACHIEVEMENT_ID,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
  });
}

async function cancelAchievementNotification() {
  await Notifications.cancelScheduledNotificationAsync(ACHIEVEMENT_ID).catch(() => {});
}

async function scheduleAppNotOpenedNotification() {
  await Notifications.cancelScheduledNotificationAsync(APP_NOT_OPENED_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: APP_NOT_OPENED_ID,
    content: { title: 'Todo', body: '最近Todoアプリを開いていません。タスクをチェックしましょう' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: APP_NOT_OPENED_INTERVAL_SECONDS,
      repeats: false,
    },
  });
}

async function cancelAppNotOpenedNotification() {
  await Notifications.cancelScheduledNotificationAsync(APP_NOT_OPENED_ID).catch(() => {});
}

export async function syncNotifications(tasks, settings) {
  if (!settings?.enabled) {
    await cancelAchievementNotification();
    await cancelAppNotOpenedNotification();
    return;
  }

  if (!(await hasPermission())) return;

  await scheduleAchievementNotification(tasks, settings.achievementHour, settings.achievementMinute);

  if (settings.appNotOpenedEnabled) {
    await scheduleAppNotOpenedNotification();
  } else {
    await cancelAppNotOpenedNotification();
  }
}
