import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getCategory } from '../constants/categories';
import AdBanner from './AdBanner';

const CARD_WIDTH = 150;
const CARD_HEIGHT = 64;

function FloatingCard({ task, category, bounds, onRestoreTask }) {
  const maxX = Math.max(bounds.width - CARD_WIDTH, 0);
  const maxY = Math.max(bounds.height - CARD_HEIGHT, 0);

  const x = useSharedValue(Math.random() * maxX);
  const y = useSharedValue(Math.random() * maxY);
  const vx = useSharedValue((Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random()));
  const vy = useSharedValue((Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random()));
  const scale = useSharedValue(1);

  useFrameCallback(() => {
    let nx = x.value + vx.value;
    let ny = y.value + vy.value;

    if (nx <= 0) {
      nx = 0;
      vx.value = Math.abs(vx.value);
    } else if (nx >= maxX) {
      nx = maxX;
      vx.value = -Math.abs(vx.value);
    }

    if (ny <= 0) {
      ny = 0;
      vy.value = Math.abs(vy.value);
    } else if (ny >= maxY) {
      ny = maxY;
      vy.value = -Math.abs(vy.value);
    }

    x.value = nx;
    y.value = ny;
  });

  const notifyRestore = () => onRestoreTask(task);

  const tap = Gesture.Tap().onEnd(() => {
    scale.value = withSequence(withTiming(1.18, { duration: 130 }), withTiming(1, { duration: 130 }));
    runOnJS(notifyRestore)();
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.card, { backgroundColor: category.color }, style]}>
        <Text style={styles.cardText} numberOfLines={2}>
          {task.text}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function TodayAchievementsScreen({ visible, tasks, categories, onClose, onRestoreTask }) {
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaProvider>
        <LinearGradient colors={['#FDC830', '#F37335']} style={styles.flex}>
          <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {tasks.length > 0
                  ? `今日は${tasks.length}個達成しました！`
                  : '今日はまだ達成したタスクがありません'}
              </Text>
              <Pressable onPress={onClose} hitSlop={8} style={styles.closeButton}>
                <Ionicons name="close" size={26} color="#fff" />
              </Pressable>
            </View>

            <View
              style={styles.pond}
              onLayout={(e) =>
                setBounds({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
              }
            >
              {bounds.width > 0 &&
                tasks.map((task) => (
                  <FloatingCard
                    key={task.id}
                    task={task}
                    category={getCategory(categories, task.categoryId)}
                    bounds={bounds}
                    onRestoreTask={onRestoreTask}
                  />
                ))}
            </View>

            <AdBanner />
          </SafeAreaView>
        </LinearGradient>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  pond: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  cardText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
});
