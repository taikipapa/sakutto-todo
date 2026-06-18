import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getCategory } from '../constants/categories';
import { completeHaptic, longPressHaptic } from '../utils/haptics';

export default function TaskItem({
  task,
  categories,
  isActive,
  drag,
  onCirclePress,
  onRowPress,
  onDelete,
  trophyPosition,
  onTrophyArrive,
}) {
  const category = getCategory(categories, task.categoryId);

  const rowRef = useRef(null);
  const opacity = useSharedValue(1);
  const exitTranslateX = useSharedValue(0);
  const flyX = useSharedValue(0);
  const flyY = useSharedValue(0);
  const flyScale = useSharedValue(1);
  const clearOpacity = useSharedValue(0);
  const isAnimatingOut = useRef(false);

  // Mirrors task.completed but flips instantly on tap, before the parent's
  // state update lands, so the checkmark/strikethrough appear immediately
  // while the exit animation is still playing.
  const [optimisticCompleted, setOptimisticCompleted] = useState(task.completed);
  useEffect(() => {
    setOptimisticCompleted(task.completed);
  }, [task.completed]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * (optimisticCompleted ? 0.6 : 1),
    transform: [
      { translateX: exitTranslateX.value + flyX.value },
      { translateY: flyY.value },
      { scale: flyScale.value },
    ],
  }));

  const clearStyle = useAnimatedStyle(() => ({
    opacity: clearOpacity.value,
  }));

  const circleIcon = optimisticCompleted ? 'checkmark-circle' : 'ellipse-outline';
  const circleColor = optimisticCompleted ? '#4CAF50' : '#B0B5BB';

  const handleLongPress = () => {
    if (!drag) return;
    longPressHaptic();
    drag();
  };

  const handleCirclePress = () => {
    if (isAnimatingOut.current) return;
    isAnimatingOut.current = true;

    const completing = !optimisticCompleted;
    setOptimisticCompleted(completing);

    if (!completing) {
      opacity.value = withTiming(0, { duration: 260 });
      exitTranslateX.value = withTiming(-80, { duration: 260 }, () => {
        runOnJS(onCirclePress)();
      });
      return;
    }

    completeHaptic();
    clearOpacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withDelay(160, withTiming(0, { duration: 150 }))
    );

    rowRef.current?.measureInWindow((x, y, width, height) => {
      const deltaX = trophyPosition.x - (x + width / 2);
      const deltaY = trophyPosition.y - (y + height / 2);
      flyX.value = withDelay(150, withTiming(deltaX, { duration: 380 }));
      flyY.value = withDelay(150, withTiming(deltaY, { duration: 380 }));
      flyScale.value = withDelay(150, withTiming(0.12, { duration: 380 }));
      opacity.value = withDelay(
        150,
        withTiming(0, { duration: 380 }, () => {
          runOnJS(onTrophyArrive)();
          runOnJS(onCirclePress)();
        })
      );
    });
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View
        ref={rowRef}
        layout={LinearTransition.duration(250)}
        style={[styles.row, isActive && styles.rowActive, contentStyle]}
      >
        <Pressable onPress={handleCirclePress} style={styles.checkArea} hitSlop={8}>
          <Ionicons name={circleIcon} size={24} color={circleColor} />
        </Pressable>

        <Pressable style={styles.textArea} onPress={onRowPress} onLongPress={drag ? handleLongPress : undefined}>
          <Text style={[styles.text, optimisticCompleted && styles.textCompleted]}>{task.text}</Text>
          <View style={[styles.badge, { backgroundColor: category.color }]}>
            <Text style={styles.badgeText}>{category.label}</Text>
          </View>
        </Pressable>

        {!task.completed && (
          <Pressable onPress={onDelete} style={styles.deleteButton} hitSlop={8}>
            <Ionicons name="trash-outline" size={20} color="#D9534F" />
          </Pressable>
        )}

        <Animated.View style={[styles.clearBadge, clearStyle]} pointerEvents="none">
          <Text style={styles.clearText}>Clear!</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF1',
    backgroundColor: '#fff',
  },
  rowActive: {
    backgroundColor: '#F5F8FC',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  checkArea: {
    paddingRight: 10,
  },
  textArea: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: '#222',
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  clearBadge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.92)',
  },
  clearText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
