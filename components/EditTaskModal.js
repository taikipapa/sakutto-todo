import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function EditTaskModal({ visible, task, categories, onClose, onSave }) {
  const [text, setText] = useState('');
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    if (task) {
      setText(task.text);
      setCategoryId(task.categoryId);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSave(task.id, { text: trimmed, categoryId });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <Text style={styles.title}>タスクを編集</Text>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="タスク名"
            autoFocus
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryRow}
          >
            {categories.map((c) => {
              const isActive = c.id === categoryId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[
                    styles.categoryChip,
                    { borderColor: c.color },
                    isActive && { backgroundColor: c.color },
                  ]}
                >
                  <Text style={[styles.categoryChipText, { color: isActive ? '#fff' : c.color }]}>
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '88%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#222',
  },
  input: {
    backgroundColor: '#F0F1F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 14,
  },
  categoryRow: {
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#F0F1F3',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4A90D9',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
