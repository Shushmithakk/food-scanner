import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Scan',
        tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History',
        tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile',
        tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
    </Tabs>
  );
}