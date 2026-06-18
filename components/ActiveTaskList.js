import { StyleSheet, Text } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import TaskItem from './TaskItem';

export default function ActiveTaskList({
  tasks,
  categories,
  trophyPosition,
  onToggleComplete,
  onOpenEdit,
  onDelete,
  onTrophyArrive,
  onReorder,
}) {
  return (
    <DraggableFlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      // containerStyle sizes the outer wrapper View that DraggableFlatList
      // renders around the FlatList; without flex:1 here the list collapses
      // to its content height instead of filling the remaining screen space.
      containerStyle={styles.list}
      style={styles.list}
      activationDistance={10}
      onDragEnd={({ data }) => onReorder(data)}
      ListEmptyComponent={<Text style={styles.emptyText}>タスクがありません</Text>}
      contentContainerStyle={tasks.length === 0 && styles.emptyContainer}
      renderItem={({ item, drag, isActive }) => (
        <TaskItem
          task={item}
          categories={categories}
          trophyPosition={trophyPosition}
          isActive={isActive}
          drag={drag}
          onCirclePress={() => onToggleComplete(item.id)}
          onRowPress={() => onOpenEdit(item)}
          onDelete={() => onDelete(item.id)}
          onTrophyArrive={onTrophyArrive}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#AAB0B6',
    fontSize: 14,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
