import { Stack } from 'expo-router';
import { TodosProvider } from '@/context/todos-context';

export default function RootLayout() {
  return (
    <TodosProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="tasks" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-todo"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="edit-todo"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </TodosProvider>
  );
}

