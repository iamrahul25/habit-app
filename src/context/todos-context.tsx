import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

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
  const isFirstLoad = useRef(true);

  // Load on mount with daily reset logic
  useEffect(() => {
    (async () => {
      try {
        const today = todayString();
        const lastReset = await AsyncStorage.getItem(RESET_DATE_KEY);
        const stored = await AsyncStorage.getItem(TODOS_KEY);
        const parsed: Todo[] = stored ? JSON.parse(stored) : [];

        if (lastReset !== today) {
          // New day — reset all to uncompleted but keep the tasks
          const reset = parsed.map((t) => ({ ...t, completed: false }));
          setTodos(reset);
          await AsyncStorage.setItem(RESET_DATE_KEY, today);
        } else {
          setTodos(parsed);
        }
      } catch {
        setTodos([]);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persist on every change (skip the very first load-triggered set)
  useEffect(() => {
    if (!isLoaded) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos)).catch(() => {});
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

  return (
    <TodosContext.Provider value={{ todos, isLoaded, addTodo, toggleTodo, deleteTodo }}>
      {children}
    </TodosContext.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodos must be used within TodosProvider');
  return ctx;
}
