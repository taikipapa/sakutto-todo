import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdBanner from './AdBanner';
import { getCategory } from '../constants/categories';

export default function TrashModal({ visible, trash, categories, onClose, onRestore, onDeleteAll }) {
  const confirmDeleteAll = () => {
    Alert.alert(
      'すべて削除',
      'ゴミ箱のタスクをすべて完全に削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'すべて削除', style: 'destructive', onPress: onDeleteAll },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ゴミ箱</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={26} color="#333" />
          </Pressable>
        </View>

        <FlatList
          data={trash}
          keyExtractor={(item) => item.id}
          contentContainerStyle={trash.length === 0 && styles.emptyContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>ゴミ箱は空です</Text>}
          renderItem={({ item }) => {
            const category = getCategory(categories, item.categoryId);
            return (
              <View style={styles.row}>
                <View style={styles.textArea}>
                  <Text style={styles.text}>{item.text}</Text>
                  <View style={[styles.badge, { backgroundColor: category.color }]}>
                    <Text style={styles.badgeText}>{category.label}</Text>
                  </View>
                </View>
                <Pressable onPress={() => onRestore(item.id)} style={styles.restoreButton} hitSlop={8}>
                  <Ionicons name="arrow-undo-outline" size={18} color="#4A90D9" />
                  <Text style={styles.restoreText}>戻す</Text>
                </Pressable>
              </View>
            );
          }}
        />

        {trash.length > 0 && (
          <Pressable onPress={confirmDeleteAll} style={styles.deleteAllButton}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteAllText}>すべて削除</Text>
          </Pressable>
        )}

        <AdBanner />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF1',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEFF1',
  },
  textArea: {
    flex: 1,
  },
  text: {
    fontSize: 15,
    color: '#222',
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
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginLeft: 4,
  },
  restoreText: {
    color: '#4A90D9',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D9534F',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  deleteAllText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#AAB0B6',
    fontSize: 14,
  },
});
