import { useRouter } from 'expo-router';
import { Home, ListTodo, Plus, Settings } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomNavProps {
  activeTab: 'home' | 'tasks' | 'settings';
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.bottomNav}>
        {/* 1. Home Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => activeTab !== 'home' && router.push('/')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, activeTab === 'home' && styles.iconWrapActive]}>
            <Home
              size={22}
              color={activeTab === 'home' ? PURPLE : INACTIVE_COLOR}
              strokeWidth={activeTab === 'home' ? 2.5 : 2}
            />
          </View>
          <Text style={activeTab === 'home' ? styles.navLabelActive : styles.navLabel}>
            Home
          </Text>
        </TouchableOpacity>

        {/* 2. Tasks Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => activeTab !== 'tasks' && router.push('/tasks')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, activeTab === 'tasks' && styles.iconWrapActive]}>
            <ListTodo
              size={22}
              color={activeTab === 'tasks' ? PURPLE : INACTIVE_COLOR}
              strokeWidth={activeTab === 'tasks' ? 2.5 : 2}
            />
          </View>
          <Text style={activeTab === 'tasks' ? styles.navLabelActive : styles.navLabel}>
            Tasks
          </Text>
        </TouchableOpacity>

        {/* 3. Add (+) Button */}
        <View style={styles.navItem}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
            onPress={() => router.push('/add-todo')}
          >
            <Plus size={24} color="#ffffff" strokeWidth={2.8} />
          </Pressable>
        </View>

        {/* 4. Setting Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => activeTab !== 'settings' && router.push('/settings')}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, activeTab === 'settings' && styles.iconWrapActive]}>
            <Settings
              size={22}
              color={activeTab === 'settings' ? PURPLE : INACTIVE_COLOR}
              strokeWidth={activeTab === 'settings' ? 2.5 : 2}
            />
          </View>
          <Text style={activeTab === 'settings' ? styles.navLabelActive : styles.navLabel}>
            Setting
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#6366f1';
const PURPLE_DARK = '#4f46e5';
const CARD = '#ffffff';
const INACTIVE_COLOR = '#64748b';

const styles = StyleSheet.create({
  container: {
    backgroundColor: CARD,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  iconWrapActive: {
    backgroundColor: '#eef2ff',
  },
  navLabelActive: {
    fontSize: 11,
    fontWeight: '700',
    color: PURPLE,
    marginTop: 3,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: INACTIVE_COLOR,
    marginTop: 3,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
