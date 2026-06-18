import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TaskItem from './TaskItem';

export default function CompletedSection({
  tasks,
  categories,
  trophyPosition,
  collapsed,
  onToggleCollapsed,
  onToggleComplete,
  onOpenEdit,
  onDelete,
  onTrophyArrive,
}) {
  if (tasks.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.header} onPress={onToggleCollapsed}>
        <Text style={styles.headerText}>完了済み ✓（{tasks.length}件）</Text>
        <Ionicons name={collapsed ? 'chevron-up' : 'chevron-down'} size={18} color="#777" />
      </Pressable>

      {!collapsed && (
        <ScrollView style={styles.scroll} nestedScrollEnabled>
          {tasks.map((item) => (
            <TaskItem
              key={item.id}
              task={item}
              categories={categories}
              trophyPosition={trophyPosition}
              isActive={false}
              onCirclePress={() => onToggleComplete(item.id)}
              onRowPress={() => onOpenEdit(item)}
              onDelete={() => onDelete(item.id)}
              onTrophyArrive={onTrophyArrive}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: '#EEEFF1',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  scroll: {
    maxHeight: 240,
  },
});
