import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function EditTodoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { todos, editTodo } = useTodos();

  const todo = todos.find((t) => t.id === id);

  const [name, setName] = useState(todo?.name ?? '');
  const [selectedIcon, setSelectedIcon] = useState<string>(todo?.icon ?? '✅');

  if (!todo) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.notFound}>Task not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backFallback}>
          <Text style={styles.backFallbackText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    editTodo(id, name.trim(), selectedIcon);
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
        <Text style={styles.headerTitle}>Edit Task</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.body}>
        {/* Task name input */}
        <Text style={styles.sectionLabel}>Task name</Text>
        <TextInput
          style={styles.input}
          placeholder="Task name…"
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
              onPress={() => setSelectedIcon(item)}
            >
              <Text style={styles.iconEmoji}>{item}</Text>
            </Pressable>
          )}
          contentContainerStyle={styles.iconGrid}
        />
      </View>

      {/* Save button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={!canSave}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    fontSize: 16,
    color: SUBTEXT,
    marginBottom: 16,
  },
  backFallback: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PURPLE,
    borderRadius: 12,
  },
  backFallbackText: {
    color: '#fff',
    fontWeight: '600',
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
  saveBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
