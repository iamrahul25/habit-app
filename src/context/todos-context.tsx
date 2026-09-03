import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Todo {
  id: string;
  name: string;
  icon: string;
  timeMinutes?: number;
  completions?: Record<string, boolean>;
  completed?: boolean;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

