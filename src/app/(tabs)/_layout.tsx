import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { View, type ColorValue } from 'react-native';

import { colors } from '@/lib/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home'), tabBarButtonTestID: 'tab-home' }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: icon('calendar'), tabBarButtonTestID: 'tab-plan' }} />
      <Tabs.Screen
        name="new"
        options={{
          title: 'Log',
          tabBarButtonTestID: 'tab-log',
          tabBarIcon: () => (
            <View style={{ backgroundColor: colors.primary, borderRadius: 12, width: 46, height: 28, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="add" size={22} color="#fff" />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/log');
          },
        }}
      />
      <Tabs.Screen name="rank" options={{ title: 'Rank', tabBarIcon: icon('trophy'), tabBarButtonTestID: 'tab-rank' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person'), tabBarButtonTestID: 'tab-profile' }} />
    </Tabs>
  );
}
