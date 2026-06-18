import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import ActiveTaskList from './components/ActiveTaskList';
import AddCategoryModal from './components/AddCategoryModal';
import AddTaskBar from './components/AddTaskBar';
import AdBanner from './components/AdBanner';
import CategoryTabs from './components/CategoryTabs';
import EditTaskModal from './components/EditTaskModal';
import SettingsModal from './components/SettingsModal';
import TodayAchievementsScreen from './components/TodayAchievementsScreen';
import TrashModal from './components/TrashModal';
import {
  canShowInterstitialNow,
  initializeAds,
  isRewardedAdAvailable,
  showInterstitialIfReady,
  showRewardedAd,
} from './utils/ads';
import { ALL_KEY, BASE_CATEGORY_LIMIT } from './constants/categories';
import { DEFAULT_NOTIFICATION_SETTINGS } from './constants/notifications';
import { isSameDay } from './utils/date';
import { generateId } from './utils/id';
import { syncNotifications } from './utils/notifications';
import {
  loadCategories,
  loadCategoryLimitBonus,
  loadLastInterstitialShownAt,
  loadNotificationSettings,
  loadTaskCompletionCount,
  loadTasks,
  loadTrash,
  saveCategories,
  saveCategoryLimitBonus,
  saveLastInterstitialShownAt,
  saveNotificationSettings,
  saveTaskCompletionCount,
  saveTasks,
  saveTrash,
} from './utils/storage';

function applyReorder(fullList, reorderedVisible) {
  const visibleIds = new Set(reorderedVisible.map((t) => t.id));
  let i = 0;
  return fullList.map((t) => (visibleIds.has(t.id) ? reorderedVisible[i++] : t));
}

function App() {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [trash, setTrash] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [filter, setFilter] = useState(ALL_KEY);
  const [addCategoryId, setAddCategoryId] = useState(null);

  const [notificationSettings, setNotificationSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [categoryLimitBonus, setCategoryLimitBonus] = useState(0);
  const categoryLimit = BASE_CATEGORY_LIMIT + categoryLimitBonus;

  // Ad bookkeeping that never drives a render - plain refs are enough.
  const taskCompletionCountRef = useRef(0);
  const lastInterstitialShownAtRef = useRef(0);

  const [editingTask, setEditingTask] = useState(null);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [trashModalVisible, setTrashModalVisible] = useState(false);
  const [achievementsVisible, setAchievementsVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const anyModalOpen =
    !!editingTask || addCategoryModalVisible || trashModalVisible || achievementsVisible || settingsVisible;

  const trophyRef = useRef(null);
  const [trophyPosition, setTrophyPosition] = useState({ x: 0, y: 0 });
  const trophyScale = useSharedValue(1);
  const trophyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trophyScale.value }],
  }));

  const measureTrophy = () => {
    trophyRef.current?.measureInWindow((x, y, width, height) => {
      setTrophyPosition({ x: x + width / 2, y: y + height / 2 });
    });
  };

  const triggerTrophyBounce = () => {
    trophyScale.value = withSequence(withTiming(1.35, { duration: 130 }), withSpring(1));
  };

  useEffect(() => {
    (async () => {
      const [
        storedCategories,
        storedTasks,
        storedTrash,
        storedNotificationSettings,
        storedCategoryLimitBonus,
        storedTaskCompletionCount,
        storedLastInterstitialShownAt,
      ] = await Promise.all([
        loadCategories(),
        loadTasks(),
        loadTrash(),
        loadNotificationSettings(),
        loadCategoryLimitBonus(),
        loadTaskCompletionCount(),
        loadLastInterstitialShownAt(),
      ]);
      setCategories(storedCategories);
      setTasks(storedTasks);
      setTrash(storedTrash);
      setNotificationSettings(storedNotificationSettings);
      setCategoryLimitBonus(storedCategoryLimitBonus);
      taskCompletionCountRef.current = storedTaskCompletionCount;
      lastInterstitialShownAtRef.current = storedLastInterstitialShownAt;
      setAddCategoryId(storedCategories[0]?.id ?? null);
      setIsLoaded(true);
      initializeAds();
    })();
  }, []);

  useEffect(() => {
    if (isLoaded) saveCategories(categories);
  }, [categories, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveCategoryLimitBonus(categoryLimitBonus);
  }, [categoryLimitBonus, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveTasks(tasks);
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveTrash(trash);
  }, [trash, isLoaded]);

  useEffect(() => {
    if (isLoaded) saveNotificationSettings(notificationSettings);
  }, [notificationSettings, isLoaded]);

  useEffect(() => {
    if (isLoaded) syncNotifications(tasks, notificationSettings);
  }, [isLoaded, tasks, notificationSettings]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isLoaded) syncNotifications(tasks, notificationSettings);
    });
    return () => subscription.remove();
  }, [isLoaded, tasks, notificationSettings]);

  const activeCategoryId = filter === ALL_KEY ? addCategoryId : filter;

  const handleSelectTab = (id) => {
    setFilter(id);
    if (id !== ALL_KEY) setAddCategoryId(id);
  };

  const handleAddTask = (text) => {
    setTasks((prev) => [
      { id: generateId(), text, categoryId: activeCategoryId, completed: false },
      ...prev,
    ]);
  };

  const handleToggleComplete = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const completing = !task.completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: completing, completedAt: completing ? Date.now() : undefined } : t
      )
    );

    if (completing) {
      taskCompletionCountRef.current += 1;
      saveTaskCompletionCount(taskCompletionCountRef.current);

      if (
        canShowInterstitialNow({
          completionCount: taskCompletionCountRef.current,
          lastShownAt: lastInterstitialShownAtRef.current,
          anyModalOpen,
        })
      ) {
        const shown = showInterstitialIfReady();
        if (shown) {
          lastInterstitialShownAtRef.current = Date.now();
          saveLastInterstitialShownAt(lastInterstitialShownAtRef.current);
        }
      }
    }
  };

  const handleReorderActive = (reorderedVisible) => {
    setTasks((prev) => applyReorder(prev, reorderedVisible));
  };

  const handleOpenEdit = (task) => setEditingTask(task);

  const handleSaveEdit = (id, { text, categoryId }) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text, categoryId } : t)));
  };

  const handleDeleteSingle = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setTrash((prev) => [{ ...task, deletedAt: Date.now() }, ...prev]);
  };

  // Category management
  const handleAddCategory = ({ label, color }) => {
    setCategories((prev) => [...prev, { id: generateId(), label, color }]);
  };

  const handleWatchRewardedAdForCategorySlot = () => {
    if (!isRewardedAdAvailable()) {
      Alert.alert(
        '広告を表示できません',
        'この環境では広告を表示できません。development buildでお試しください。'
      );
      return;
    }
    showRewardedAd((earned) => {
      if (earned) {
        setCategoryLimitBonus((prev) => prev + 1);
        setAddCategoryModalVisible(true);
      }
    });
  };

  const handleAddCategoryPress = () => {
    if (categories.length < categoryLimit) {
      setAddCategoryModalVisible(true);
      return;
    }
    Alert.alert('カテゴリ枠の上限です', '広告を見てカテゴリ枠を1つ増やしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '広告を見る', onPress: handleWatchRewardedAdForCategorySlot },
    ]);
  };

  const handleReorderCategories = (newCategories) => {
    setCategories(newCategories);
  };

  const handleDeleteCategory = (id) => {
    const remaining = categories.filter((c) => c.id !== id);
    const fallbackId = remaining[0]?.id ?? null;
    setCategories(remaining);
    setTasks((prev) =>
      prev.map((t) => (t.categoryId === id ? { ...t, categoryId: fallbackId } : t))
    );
    setTrash((prev) =>
      prev.map((t) => (t.categoryId === id ? { ...t, categoryId: fallbackId } : t))
    );
    if (filter === id) setFilter(ALL_KEY);
    if (addCategoryId === id) setAddCategoryId(fallbackId);
  };

  // Trash
  const handleRestore = (id) => {
    const task = trash.find((t) => t.id === id);
    if (!task) return;
    const { deletedAt, ...rest } = task;
    setTrash((prev) => prev.filter((t) => t.id !== id));
    setTasks((prev) => [rest, ...prev]);
  };

  const handleDeleteAllForever = () => {
    setTrash([]);
  };

  const handleRestoreFromAchievements = (task) => {
    Alert.alert('Todoをリストに戻す', 'このTodoをリストに戻しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '戻す',
        onPress: () => {
          setTasks((prev) => [
            { id: generateId(), text: task.text, categoryId: task.categoryId, completed: false },
            ...prev,
          ]);
        },
      },
    ]);
  };

  const activeVisible = tasks.filter(
    (t) => !t.completed && (filter === ALL_KEY || t.categoryId === filter)
  );
  const todayCompleted = tasks.filter((t) => t.completed && isSameDay(t.completedAt));

  if (!isLoaded) return null;

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Todo</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setAchievementsVisible(true)} style={styles.headerIcon} hitSlop={8}>
              <Animated.View ref={trophyRef} onLayout={measureTrophy} style={trophyAnimatedStyle}>
                <Ionicons name="trophy-outline" size={22} color="#F0AD4E" />
              </Animated.View>
              {todayCompleted.length > 0 && (
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>{todayCompleted.length}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => setTrashModalVisible(true)} style={styles.headerIcon} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color="#555" />
              {trash.length > 0 && (
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>{trash.length}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => setSettingsVisible(true)} style={styles.headerIcon} hitSlop={8}>
              <Ionicons name="settings-outline" size={22} color="#555" />
            </Pressable>
          </View>
        </View>

        <CategoryTabs
          categories={categories}
          selected={filter}
          onSelect={handleSelectTab}
          onReorder={handleReorderCategories}
          onDeleteCategory={handleDeleteCategory}
          onAddPress={handleAddCategoryPress}
        />
        <AddTaskBar
          categories={categories}
          categoryId={activeCategoryId}
          onAdd={handleAddTask}
        />

        <ActiveTaskList
          tasks={activeVisible}
          categories={categories}
          trophyPosition={trophyPosition}
          onToggleComplete={handleToggleComplete}
          onOpenEdit={handleOpenEdit}
          onDelete={handleDeleteSingle}
          onTrophyArrive={triggerTrophyBounce}
          onReorder={handleReorderActive}
        />

        <AdBanner />
      </SafeAreaView>

      <AddCategoryModal
        visible={addCategoryModalVisible}
        onClose={() => setAddCategoryModalVisible(false)}
        onSave={handleAddCategory}
      />

      <EditTaskModal
        visible={!!editingTask}
        task={editingTask}
        categories={categories}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />

      <TrashModal
        visible={trashModalVisible}
        trash={trash}
        categories={categories}
        onClose={() => setTrashModalVisible(false)}
        onRestore={handleRestore}
        onDeleteAll={handleDeleteAllForever}
      />

      <TodayAchievementsScreen
        visible={achievementsVisible}
        tasks={todayCompleted}
        categories={categories}
        onClose={() => setAchievementsVisible(false)}
        onRestoreTask={handleRestoreFromAchievements}
      />

      <SettingsModal
        visible={settingsVisible}
        settings={notificationSettings}
        onClose={() => setSettingsVisible(false)}
        onChange={setNotificationSettings}
      />
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    padding: 4,
  },
  iconBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#D9534F',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});
