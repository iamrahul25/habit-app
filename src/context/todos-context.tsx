import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Todo {
  id: string;
  name: string;
  icon: string;
  timeMinutes?: number;
  createdAt?: string;
  completions?: Record<string, boolean>;
  completed?: boolean;
}

export interface TodoInsights {
  currentStreak: number;
  maxStreak: number;
  completedCount: number;
  missedCount: number;
  completedPct: number;
  missedPct: number;
  weekCompleted: number;
  weekTotal: number;
  monthCompleted: number;
  monthTotal: number;
  allTimeCompleted: number;
  allTimeTotal: number;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const parts = key.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // Monday is 1, Sunday is 0. If Sunday, diff is -6; otherwise 1 - day
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isTodoCompleted(todo: Todo, dateKey?: string): boolean {
  const key = dateKey || formatDateKey(new Date());
  if (todo.completions && typeof todo.completions[key] === 'boolean') {
    return todo.completions[key];
  }
  if (key === formatDateKey(new Date()) && typeof todo.completed === 'boolean') {
    return todo.completed;
  }
  return false;
}

export function getTodoInsights(todo: Todo): TodoInsights {
  const now = new Date();
  const todayKey = formatDateKey(now);

  // 1. Determine creation date
  let createdDate: Date;
  if (todo.createdAt) {
    createdDate = new Date(todo.createdAt);
  } else if (!isNaN(Number(todo.id)) && Number(todo.id) > 1500000000000) {
    createdDate = new Date(Number(todo.id));
  } else {
    createdDate = new Date(now);
  }

  const startOfCreated = new Date(
    createdDate.getFullYear(),
    createdDate.getMonth(),
    createdDate.getDate()
  );
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // 2. Determine starting date: minimum of creation date or first tick mark
  const completions = todo.completions || {};
  const completedKeys = Object.keys(completions)
    .filter((k) => completions[k] && k <= todayKey)
    .sort();

  let startDate = startOfCreated;
  if (completedKeys.length > 0) {
    const firstTickDate = parseDateKey(completedKeys[0]);
    if (firstTickDate.getTime() < startDate.getTime()) {
      startDate = firstTickDate;
    }
  }

  // Safety: start date should not be after today
  if (startDate.getTime() > startOfToday.getTime()) {
    startDate = startOfToday;
  }

  const diffMs = startOfToday.getTime() - startDate.getTime();
  const rawElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  let allTimeTotal = Math.max(1, rawElapsed);
  const allTimeCompleted = completedKeys.length;

  if (allTimeCompleted > allTimeTotal) {
    allTimeTotal = allTimeCompleted;
  }

  const missedCount = Math.max(0, allTimeTotal - allTimeCompleted);
  const completedPct =
    allTimeTotal > 0 ? Math.round((allTimeCompleted / allTimeTotal) * 100) : 0;
  const missedPct = allTimeTotal > 0 ? Math.max(0, 100 - completedPct) : 0;

  // 2. Current streak
  let currentStreak = 0;
  const todayDone = isTodoCompleted(todo, todayKey);
  let checkDate = new Date(startOfToday);

  if (todayDone) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
    while (isTodoCompleted(todo, formatDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isTodoCompleted(todo, formatDateKey(yesterday))) {
      currentStreak = 1;
      checkDate = yesterday;
      checkDate.setDate(checkDate.getDate() - 1);
      while (isTodoCompleted(todo, formatDateKey(checkDate))) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      currentStreak = 0;
    }
  }

  // 3. Max streak
  let maxStreak = currentStreak;
  const sortedDates = [...completedKeys].sort();
  if (sortedDates.length > 0) {
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const dayDiff = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
  }

  // 4. This week (Monday to Sunday)
  const monday = getMonday(now);
  let weekCompleted = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (isTodoCompleted(todo, formatDateKey(d))) {
      weekCompleted++;
    }
  }
  const weekTotal = 7;

  // 5. This month
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthTotal = new Date(year, month + 1, 0).getDate();
  let monthCompleted = 0;
  for (let day = 1; day <= monthTotal; day++) {
    const d = new Date(year, month, day);
    if (isTodoCompleted(todo, formatDateKey(d))) {
      monthCompleted++;
    }
  }

  return {
    currentStreak,
    maxStreak,
    completedCount: allTimeCompleted,
    missedCount,
    completedPct,
    missedPct,
    weekCompleted,
    weekTotal,
    monthCompleted,
    monthTotal,
    allTimeCompleted,
    allTimeTotal,
  };
}

interface TodosContextType {
  todos: Todo[];
  isLoaded: boolean;
  addTodo: (name: string, icon: string, timeMinutes?: number) => void;
  toggleTodo: (id: string, dateKey?: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, name: string, icon: string, timeMinutes?: number) => void;
  isTodoCompleted: (todo: Todo, dateKey?: string) => boolean;
}

const TODOS_KEY = '@habit_app_todos';

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export function TodosProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount and migrate legacy data if needed
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TODOS_KEY);
        let parsed: any[] = [];
        try { parsed = stored ? JSON.parse(stored) : []; } catch { parsed = []; }

        const todayKey = formatDateKey(new Date());
        const migrated: Todo[] = parsed.map((t) => {
          const completions: Record<string, boolean> = { ...(t.completions || {}) };
          if (typeof t.completed === 'boolean' && completions[todayKey] === undefined) {
            completions[todayKey] = t.completed;
          }
          const timeMinutes =
            typeof t.timeMinutes === 'number' && t.timeMinutes > 0 ? t.timeMinutes : 30;
          return {
            id: String(t.id),
            name: t.name,
            icon: t.icon,
            timeMinutes,
            createdAt: t.createdAt || new Date().toISOString(),
            completions,
          };
        });

        setTodos(migrated);
      } catch (e) {
        console.warn('[TodosContext] Failed to load from AsyncStorage:', e);
        setTodos([]);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persist todos whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos)).catch((e) =>
      console.warn('[TodosContext] Failed to save to AsyncStorage:', e)
    );
  }, [todos, isLoaded]);

  const addTodo = (name: string, icon: string, timeMinutes?: number) => {
    const minutes =
      typeof timeMinutes === 'number' && !isNaN(timeMinutes) && timeMinutes > 0
        ? timeMinutes
        : 30;
    const newTodo: Todo = {
      id: Date.now().toString(),
      name: name.trim(),
      icon,
      timeMinutes: minutes,
      createdAt: new Date().toISOString(),
      completions: {},
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id: string, dateKey?: string) => {
    const targetDate = dateKey || formatDateKey(new Date());
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const currentCompletions = t.completions || {};
        const currentlyDone = isTodoCompleted(t, targetDate);
        return {
          ...t,
          completions: {
            ...currentCompletions,
            [targetDate]: !currentlyDone,
          },
        };
      })
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const editTodo = (id: string, name: string, icon: string, timeMinutes?: number) => {
    const minutes =
      typeof timeMinutes === 'number' && !isNaN(timeMinutes) && timeMinutes > 0
        ? timeMinutes
        : 30;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, name: name.trim(), icon, timeMinutes: minutes } : t
      )
    );
  };

  return (
    <TodosContext.Provider
      value={{
        todos,
        isLoaded,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        isTodoCompleted,
      }}
    >
      {children}
    </TodosContext.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodos must be used within TodosProvider');
  return ctx;
}

