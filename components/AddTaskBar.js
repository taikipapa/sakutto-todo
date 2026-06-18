import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategory } from '../constants/categories';

export default function AddTaskBar({ categories, categoryId, onAdd }) {
  const [text, setText] = useState('');
  const categoryInfo = getCategory(categories, categoryId);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.categoryDot, { backgroundColor: categoryInfo.color }]} />
      <TextInput
        style={styles.input}
        placeholder={`「${categoryInfo.label}」に追加`}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F1F3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4A90D9',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
