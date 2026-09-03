import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Todo {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
}

interface TodosContextType {
  todos: Todo[];
  isLoaded: boolean;
  addTodo: (name: string, icon: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, name: string, icon: string) => void;
}

const TODOS_KEY = '@habit_app_todos';
const RESET_DATE_KEY = '@habit_app_last_reset';

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export function TodosProvider({ children }: { children: React.ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const today = todayString();
        const lastReset = await AsyncStorage.getItem(RESET_DATE_KEY);
        const stored = await AsyncStorage.getItem(TODOS_KEY);
        let parsed: Todo[] = [];
        try { parsed = stored ? JSON.parse(stored) : []; } catch { parsed = []; }

        if (lastReset !== today) {
          // New day — reset completed flags and persist both keys atomically
          const reset = parsed.map((t) => ({ ...t, completed: false }));
          await AsyncStorage.multiSet([
            [RESET_DATE_KEY, today],
            [TODOS_KEY, JSON.stringify(reset)],
          ]);
          setTodos(reset);
        } else {
          setTodos(parsed);
        }
      } catch (e) {
        console.warn('[TodosContext] Failed to load from AsyncStorage:', e);
        setTodos([]);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persist todos whenever they change — guarded by isLoaded so we never
  // overwrite storage before the initial load has completed.
  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos)).catch((e) =>
      console.warn('[TodosContext] Failed to save to AsyncStorage:', e)
    );
  }, [todos, isLoaded]);

  const addTodo = (name: string, icon: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      name: name.trim(),
      icon,
      completed: false,
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const editTodo = (id: string, name: string, icon: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: name.trim(), icon } : t))
    );
  };

  return (
    <TodosContext.Provider value={{ todos, isLoaded, addTodo, toggleTodo, deleteTodo, editTodo }}>
      {children}
    </TodosContext.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodos must be used within TodosProvider');
  return ctx;
}
