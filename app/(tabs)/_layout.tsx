import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native'; 
import { useContext } from 'react';
import { ThemeContext } from '../../components/ThemeContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const themeContext = useContext(ThemeContext);

  if (!themeContext) return null;

  const { selectedTheme } = themeContext;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: selectedTheme.tab,       
        tabBarInactiveTintColor: selectedTheme.tabInactive, 
        tabBarStyle: {
          backgroundColor: selectedTheme.bg,               
          borderTopWidth: 1,
          borderTopColor: selectedTheme.primary,          
        },
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <TabBarIcon name="leaf" color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabBarIcon name="line-chart" color={color} />,
        }}
      />
       {/* Stats */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>

  );
}
