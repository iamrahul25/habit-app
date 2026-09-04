import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { formatDateKey, isTodoCompleted, useTodos } from '@/context/todos-context';
import { InsightsModal } from '@/components/insights-modal';
import { BottomNav } from '@/components/bottom-nav';

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // Monday is 1, Sunday is 0. If Sunday, diff is -6; otherwise 1 - day
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDaysFromMonday(monday: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function DayProgressRing({
  dateNum,
  done,
  total,
  isSelected,
  isToday,
}: {
  dateNum: number;
  done: number;
  total: number;
  isSelected: boolean;
  isToday: boolean;
}) {
  const size = 34;
  const strokeWidth = 2.8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total === 0 ? 0 : Math.min(1, Math.max(0, done / total));
  const strokeDashoffset = circumference * (1 - ratio);
  const isAllDone = total > 0 && done === total;

  // Background fill of inner disc
  const fillColor = isSelected
    ? '#ffffff'
    : isToday
    ? 'rgba(251, 191, 36, 0.18)'
    : 'rgba(255, 255, 255, 0.18)';

  // Track circle color
  const trackColor = isSelected
    ? 'rgba(3, 105, 161, 0.18)'
    : isToday
    ? 'rgba(251, 191, 36, 0.35)'
    : 'rgba(255, 255, 255, 0.22)';

  // Progress stroke color
  const progressStrokeColor = isAllDone
    ? '#10b981' // 100% complete: Emerald Green
    : isSelected
    ? '#0284c7' // Selected: Vibrant Blue
    : isToday
    ? '#f59e0b' // Today: Warm Amber
    : '#38bdf8'; // Other days: Sky Blue

  // Number text color
  const textColor = isSelected
    ? isAllDone
      ? '#059669'
      : '#0369a1'
    : isToday
    ? '#fef08a'
    : '#ffffff';

  return (
    <View style={styles.ringContainer}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        {/* Track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill={fillColor}
        />
        {/* Progress stroke */}
        {ratio > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressStrokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        )}
      </Svg>
      <Text style={[styles.ringDateText, { color: textColor }]}>
        {dateNum}
      </Text>
    </View>
  );
}

function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const pct = total === 0 ? 0 : done / total;
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: pct,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
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
  name,
  icon,
  timeMinutes,
  completed,
  disabled = false,
  onToggle,
}: {
  name: string;
  icon: string;
  timeMinutes?: number;
  completed: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
          <Text
            style={[
              styles.todoName,
              completed && styles.todoNameDone,
              disabled && styles.todoNameDisabled,
            ]}
          >
            {name}
          </Text>
          <View
            style={[
              styles.timeBadge,
              completed && styles.timeBadgeDone,
              disabled && styles.timeBadgeDisabled,
            ]}
          >
            <Text style={[styles.timeBadgeText, disabled && styles.timeBadgeTextDisabled]}>
              ⏱️ {timeMinutes ?? 30} min
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { todos, isLoaded, toggleTodo } = useTodos();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => getMonday(new Date()));
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const currentWeekMonday = getMonday(new Date());
  const isCurrentOrFutureWeek = weekStartDate.getTime() >= currentWeekMonday.getTime();

  const selectedDateKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());
  const isViewingToday = selectedDateKey === todayKey;
  const isFutureDate = selectedDateKey > todayKey;

  const weekDays = getWeekDaysFromMonday(weekStartDate);

  // Previous and Next week navigation
  const goToPrevWeek = () => {
    setWeekStartDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const goToNextWeek = () => {
    if (weekStartDate.getTime() >= currentWeekMonday.getTime()) return;
    setWeekStartDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const goToToday = () => {
    const now = new Date();
    setWeekStartDate(getMonday(now));
    setSelectedDate(now);
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
  };

  // Format month and year label for current week view
  const mondayMonth = weekDays[0].toLocaleDateString('en-US', { month: 'short' });
  const sundayMonth = weekDays[6].toLocaleDateString('en-US', { month: 'short' });
  const yearStr = weekDays[6].getFullYear();
  const weekMonthYear =
    mondayMonth === sundayMonth
      ? `${weekDays[0].toLocaleDateString('en-US', { month: 'long' })} ${yearStr}`
      : `${mondayMonth} - ${sundayMonth} ${yearStr}`;

  // Progress for the selected date
  const done = todos.filter((t) => isTodoCompleted(t, selectedDateKey)).length;
  const total = todos.length;

  const progressLabel = isViewingToday
    ? "Today's Progress"
    : isFutureDate
    ? `${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (Upcoming)`
    : `${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} Progress`;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header Container */}
      <View style={styles.header}>
        {/* Top title row */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.headerTitle}>Daily Tasks</Text>
            <Text style={styles.headerDate}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.headerButtonsRow}>
            <TouchableOpacity
              style={styles.insightsButton}
              onPress={() => setIsInsightsOpen(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.insightsButtonText}>📊 Insights</Text>
            </TouchableOpacity>
            {!isViewingToday && (
              <TouchableOpacity style={styles.todayButton} onPress={goToToday} activeOpacity={0.8}>
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Week navigation row */}
        <View style={styles.weekNavRow}>
          <TouchableOpacity
            style={styles.navArrowBtn}
            onPress={goToPrevWeek}
            hitSlop={8}
            activeOpacity={0.7}
          >
            <Text style={styles.navArrowText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.weekRangeText}>{weekMonthYear}</Text>

          {!isCurrentOrFutureWeek ? (
            <TouchableOpacity
              style={styles.navArrowBtn}
              onPress={goToNextWeek}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Text style={styles.navArrowText}>›</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navArrowPlaceholder} />
          )}
        </View>

        {/* 7-day pill slider row */}
        <View style={styles.weekPillsRow}>
          {weekDays.map((day, index) => {
            const dayKey = formatDateKey(day);
            const isSelected = dayKey === selectedDateKey;
            const isToday = dayKey === todayKey;
            const dayDone = todos.filter((t) => isTodoCompleted(t, dayKey)).length;

            return (
              <TouchableOpacity
                key={dayKey}
                style={[
                  styles.pill,
                  isToday && !isSelected && styles.pillToday,
                  isSelected && styles.pillSelected,
                  isToday && isSelected && styles.pillTodaySelected,
                ]}
                onPress={() => handleSelectDay(day)}
                activeOpacity={0.85}
              >
                <View style={styles.pillDayNameRow}>
                  <Text
                    style={[
                      styles.pillDayName,
                      isToday && styles.pillDayNameToday,
                      isSelected && styles.pillDayNameSelected,
                    ]}
                  >
                    {DAY_LABELS[index]}
                  </Text>
                  {isToday && <View style={styles.todayDot} />}
                </View>

                {/* Circular completion ring around date number */}
                <DayProgressRing
                  dateNum={day.getDate()}
                  done={dayDone}
                  total={total}
                  isSelected={isSelected}
                  isToday={isToday}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Progress */}
      <ProgressBar done={done} total={total} label={progressLabel} />

      {/* Task list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isFutureDate && (
          <View style={styles.futureNoticeBanner}>
            <Text style={styles.futureNoticeText}>
              🔒 Future date tasks cannot be checked off yet.
            </Text>
          </View>
        )}
        {!isLoaded ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : todos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first task</Text>
          </View>
        ) : (
          todos.map((todo) => {
            const completed = isTodoCompleted(todo, selectedDateKey);
            return (
              <TodoItem
                key={todo.id}
                name={todo.name}
                icon={todo.icon}
                timeMinutes={todo.timeMinutes}
                completed={completed}
                disabled={isFutureDate}
                onToggle={() => {
                  if (!isFutureDate) {
                    toggleTodo(todo.id, selectedDateKey);
                  }
                }}
              />
            );
          })
        )}
      </ScrollView>

      {/* Bottom nav */}
      <BottomNav activeTab="home" />
      <InsightsModal
        visible={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        todos={todos}
      />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightsButton: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  insightsButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  todayButton: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  todayButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  weekNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  navArrowPlaceholder: {
    width: 32,
    height: 32,
  },
  weekRangeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  weekPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  pill: {
    width: 44,
    height: 74,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillToday: {
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    borderColor: '#f59e0b',
    borderWidth: 1.5,
  },
  pillSelected: {
    backgroundColor: '#0ea5e9', // Vibrant blue pill like the reference screenshot
    borderColor: '#38bdf8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1.05 }],
  },
  pillTodaySelected: {
    borderColor: '#fbbf24',
    borderWidth: 2,
  },
  pillDayNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  pillDayName: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  pillDayNameToday: {
    color: '#fbbf24',
    fontWeight: '800',
  },
  pillDayNameSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fbbf24',
    marginLeft: 1,
  },
  ringContainer: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDateText: {
    fontSize: 13,
    fontWeight: '800',
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
  futureNoticeBanner: {
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 12,
    alignItems: 'center',
  },
  futureNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
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
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  todoIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  todoInfoWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todoName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
    marginRight: 8,
  },
  todoNameDone: {
    textDecorationLine: 'line-through',
    color: SUBTEXT,
  },
  timeBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeBadgeDone: {
    backgroundColor: '#f8fafc',
    opacity: 0.6,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  todoCardDisabled: {
    opacity: 0.65,
  },
  checkboxDisabled: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
  },
  todoIconDisabled: {
    opacity: 0.5,
  },
  todoNameDisabled: {
    color: '#64748b',
  },
  timeBadgeDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.7,
  },
  timeBadgeTextDisabled: {
    color: '#94a3b8',
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

