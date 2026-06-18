import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { ALL_KEY } from '../constants/categories';
import { longPressHaptic } from '../utils/haptics';

export default function CategoryTabs({
  categories,
  selected,
  onSelect,
  onReorder,
  onDeleteCategory,
  onAddPress,
}) {
  const confirmDelete = (category) => {
    if (categories.length <= 1) {
      Alert.alert('削除できません', '最後のカテゴリは削除できません。');
      return;
    }
    Alert.alert(
      'カテゴリを削除',
      `「${category.label}」を削除しますか？このカテゴリのタスクは別のカテゴリに移動します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => onDeleteCategory(category.id),
        },
      ]
    );
  };

  return (
    <DraggableFlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={(item) => item.id}
      containerStyle={styles.container}
      contentContainerStyle={styles.contentContainer}
      // Without an activation distance, the list's internal pan gesture has no
      // movement threshold and can steal the touch before the cell's onLongPress
      // timer fires, so long-press-to-drag never engages. This gives the
      // long-press time to register before a drag gesture takes over.
      activationDistance={10}
      onDragEnd={({ data, from, to }) => {
        if (from === to) {
          confirmDelete(categories[from]);
        } else {
          onReorder(data);
        }
      }}
      ListHeaderComponent={
        <Pressable
          onPress={() => onSelect(ALL_KEY)}
          style={[
            styles.tab,
            { borderColor: '#555' },
            selected === ALL_KEY && { backgroundColor: '#555' },
          ]}
        >
          <Text style={[styles.tabText, { color: selected === ALL_KEY ? '#fff' : '#555' }]}>
            すべて
          </Text>
        </Pressable>
      }
      ListFooterComponent={
        <Pressable onPress={onAddPress} style={styles.addButton}>
          <Ionicons name="add" size={18} color="#4A90D9" />
        </Pressable>
      }
      renderItem={({ item, drag, isActive }) => {
        const isActiveTab = item.id === selected;
        const handleLongPress = () => {
          longPressHaptic();
          drag();
        };
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            onLongPress={handleLongPress}
            disabled={isActive}
            style={[
              styles.tab,
              { borderColor: item.color },
              isActiveTab && { backgroundColor: item.color },
              isActive && styles.dragging,
            ]}
          >
            <Text
              style={[styles.tabText, { color: isActiveTab ? '#fff' : item.color }]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 6,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dragging: {
    opacity: 0.6,
  },
  addButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#4A90D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
