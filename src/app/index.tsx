import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTodos } from '@/context/todos-context';

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : done / total;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>Today's Progress</Text>
        <Text style={styles.progressCount}>
          {done}/{total} done
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {total > 0 && done === total && (
        <Text style={styles.allDoneText}>🎉 All tasks complete!</Text>
      )}
    </View>
  );
}

function TodoItem({
  id,
  name,
  icon,
  completed,
  onToggle,
  onDelete,
}: {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[styles.todoCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.todoRow}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <View style={styles.todoLeft}>
          <View style={[styles.checkbox, completed && styles.checkboxDone]}>
            {completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.todoIcon}>{icon}</Text>
          <Text style={[styles.todoName, completed && styles.todoNameDone]}>{name}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { todos, isLoaded, toggleTodo, deleteTodo } = useTodos();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const done = todos.filter((t) => t.completed).length;
  const total = todos.length;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Tasks</Text>
        <Text style={styles.headerDate}>{dateStr}</Text>
      </View>

      {/* Progress */}
      <ProgressBar done={done} total={total} />

      {/* Task list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!isLoaded ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : todos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
          </View>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              {...todo}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        {/* Home tab */}
        <View style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </View>

        {/* Add button */}
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && { transform: [{ scale: 0.92 }] }]}
          onPress={() => router.push('/add-todo')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>

        {/* Spacer to balance layout */}
        <View style={styles.navItem} />
      </View>
    </View>
  );
}

const PURPLE = '#6366f1';
const PURPLE_DARK = '#4f46e5';
const BG = '#f8f7ff';
const CARD = '#ffffff';
const TEXT = '#1e1b4b';
const SUBTEXT = '#6b7280';
const GREEN = '#10b981';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: PURPLE,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginTop: -14,
    borderRadius: 16,
    padding: 16,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: PURPLE,
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PURPLE,
    borderRadius: 99,
  },
  allDoneText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: SUBTEXT,
    marginTop: 6,
    textAlign: 'center',
  },
  todoCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  todoIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  todoName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    flex: 1,
  },
  todoNameDone: {
    textDecorationLine: 'line-through',
    color: SUBTEXT,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#d1d5db',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    fontSize: 20,
  },
  navLabelActive: {
    fontSize: 11,
    fontWeight: '600',
    color: PURPLE,
    marginTop: 2,
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: PURPLE_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 34,
  },
});
