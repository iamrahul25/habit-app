import { useRouter } from 'expo-router';
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
    <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Home tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => activeTab !== 'home' && router.push('/')}
        activeOpacity={0.7}
      >
        <Text style={activeTab === 'home' ? styles.navIconActive : styles.navIcon}>🏠</Text>
        <Text style={activeTab === 'home' ? styles.navLabelActive : styles.navLabel}>Home</Text>
      </TouchableOpacity>

      {/* Add button */}
      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && { transform: [{ scale: 0.92 }] }]}
        onPress={() => router.push('/add-todo')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>

      {/* Tasks tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => activeTab !== 'tasks' && router.push('/tasks')}
        activeOpacity={0.7}
      >
        <Text style={activeTab === 'tasks' ? styles.navIconActive : styles.navIcon}>📋</Text>
        <Text style={activeTab === 'tasks' ? styles.navLabelActive : styles.navLabel}>Tasks</Text>
      </TouchableOpacity>

      {/* Setting tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => activeTab !== 'settings' && router.push('/settings')}
        activeOpacity={0.7}
      >
        <Text style={activeTab === 'settings' ? styles.navIconActive : styles.navIcon}>⚙️</Text>
        <Text style={activeTab === 'settings' ? styles.navLabelActive : styles.navLabel}>Setting</Text>
      </TouchableOpacity>
    </View>
  );
}

const PURPLE = '#6366f1';
const PURPLE_DARK = '#4f46e5';
const CARD = '#ffffff';
const SUBTEXT = '#6b7280';

const styles = StyleSheet.create({
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
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: SUBTEXT,
    marginTop: 2,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: PURPLE_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 32,
  },
});
