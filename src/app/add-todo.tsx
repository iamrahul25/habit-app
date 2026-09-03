import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTodos } from '@/context/todos-context';

const ICONS = [
  '🏃', '📚', '💧', '🍎', '💪', '😴',
  '🧘', '✍️', '🎯', '🎵', '🍳', '🌿',
  '💊', '🧹', '🛒', '💰', '🎨', '🐕',
  '☕', '🌅', '🏋️', '🚴', '🤸', '🧠',
  '📝', '🛁', '🪴', '🎮', '📸', '🤝',
];

const DEFAULT_ICON = '✅';

export default function AddTodoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addTodo } = useTodos();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const canAdd = name.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addTodo(name.trim(), selectedIcon ?? DEFAULT_ICON);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        {/* Task name input */}
        <Text style={styles.sectionLabel}>Task name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Morning run, Read 20 pages…"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
          returnKeyType="done"
          maxLength={60}
          autoFocus
        />

        {/* Icon picker */}
        <Text style={styles.sectionLabel}>Pick an icon</Text>
        <FlatList
          data={ICONS}
          keyExtractor={(item) => item}
          numColumns={6}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.iconBtn,
                selectedIcon === item && styles.iconBtnSelected,
              ]}
              onPress={() => setSelectedIcon((prev) => (prev === item ? null : item))}
            >
              <Text style={styles.iconEmoji}>{item}</Text>
            </Pressable>
          )}
          contentContainerStyle={styles.iconGrid}
        />



      </View>

      {/* Add button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
          onPress={handleAdd}
          activeOpacity={0.85}
          disabled={!canAdd}
        >
          <Text style={styles.addBtnText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const PURPLE = '#6366f1';
const PURPLE_LIGHT = '#eef2ff';
const TEXT = '#1e1b4b';
const SUBTEXT = '#6b7280';
const BORDER = '#e5e7eb';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: SUBTEXT,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: SUBTEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT,
    marginBottom: 24,
  },
  iconGrid: {
    gap: 8,
  },
  iconBtn: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  iconBtnSelected: {
    backgroundColor: PURPLE_LIGHT,
    borderColor: PURPLE,
  },
  iconEmoji: {
    fontSize: 24,
  },


  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  addBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
