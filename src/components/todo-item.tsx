import { Bell, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface TodoItemProps {
  name: string;
  icon: string;
  timeMinutes?: number;
  notificationTime?: string;
  notificationEnabled?: boolean;
  completed: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onToggleNotification?: () => void;
}

export function TodoItem({
  name,
  icon,
  timeMinutes,
  notificationTime,
  notificationEnabled,
  completed,
  disabled = false,
  onToggle,
  onToggleNotification,
}: TodoItemProps) {
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handleToggle = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View
      style={[
        styles.todoCard,
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.todoCardDisabled,
      ]}
    >
      <TouchableOpacity
        style={styles.todoRow}
        onPress={handleToggle}
        activeOpacity={disabled ? 1 : 0.8}
        disabled={disabled}
      >
        <View
          style={[
            styles.checkbox,
            completed && styles.checkboxDone,
            disabled && styles.checkboxDisabled,
          ]}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.todoIcon, disabled && styles.todoIconDisabled]}>{icon}</Text>
        <View style={styles.todoInfoWrap}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={[
                styles.todoName,
                completed && styles.todoNameDone,
                disabled && styles.todoNameDisabled,
              ]}
              numberOfLines={1}
            >
              {name}
            </Text>
            {notificationTime ? (
              <Text style={styles.timingSubtext}>
                ⏰ {notificationTime}
              </Text>
            ) : null}
          </View>

          <View style={styles.badgesRow}>
            {onToggleNotification && (
              <TouchableOpacity
                style={[
                  styles.bellBtn,
                  notificationEnabled && styles.bellBtnActive,
                ]}
                onPress={onToggleNotification}
                hitSlop={6}
              >
                <Bell
                  size={12}
                  color={notificationEnabled ? '#6366f1' : '#94a3b8'}
                />
              </TouchableOpacity>
            )}

            <View
              style={[
                styles.timeBadge,
                completed && styles.timeBadgeDone,
                disabled && styles.timeBadgeDisabled,
              ]}
            >
              <Clock size={11} color={disabled ? '#94a3b8' : '#64748b'} style={{ marginRight: 3 }} />
              <Text style={[styles.timeBadgeText, disabled && styles.timeBadgeTextDisabled]}>
                {timeMinutes ?? 30}m
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const CARD = '#ffffff';
const TEXT = '#1e1b4b';
const SUBTEXT = '#6b7280';
const GREEN = '#10b981';

const styles = StyleSheet.create({
  todoCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  todoCardDisabled: {
    opacity: 0.65,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
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
  checkboxDisabled: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
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
  todoIconDisabled: {
    opacity: 0.5,
  },
  todoInfoWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoName: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
  todoNameDone: {
    textDecorationLine: 'line-through',
    color: SUBTEXT,
  },
  todoNameDisabled: {
    color: '#64748b',
  },
  timingSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bellBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBtnActive: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  timeBadgeDone: {
    backgroundColor: '#f8fafc',
    opacity: 0.6,
  },
  timeBadgeDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.7,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  timeBadgeTextDisabled: {
    color: '#94a3b8',
  },
});
