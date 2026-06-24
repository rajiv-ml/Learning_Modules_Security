import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '@features/progress/DashboardScreen';
import { ModulesScreen } from '@features/learning/ModulesScreen';
import { AssessmentsDashboardScreen } from '@features/assessment/AssessmentsDashboardScreen';
import { ProgressScreen } from '@features/progress/ProgressScreen';
import { colors } from '@shared/theme/colors';
import { Text } from 'react-native';
import type { MainTabParamList } from '@shared/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ color, size }) => {
          let icon = '🏠'; // fallback
          if (route.name === 'HomeTab') icon = '🏠';
          else if (route.name === 'ModulesTab') icon = '📚';
          else if (route.name === 'AssessmentsTab') icon = '📝';
          else if (route.name === 'ProgressTab') icon = '📊';

          return <Text style={{ fontSize: size as number, color }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={DashboardScreen} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="ModulesTab" 
        component={ModulesScreen} 
        options={{ tabBarLabel: 'Modules' }} 
      />
      <Tab.Screen 
        name="AssessmentsTab" 
        component={AssessmentsDashboardScreen} 
        options={{ tabBarLabel: 'Assessments' }} 
      />
      <Tab.Screen 
        name="ProgressTab" 
        component={ProgressScreen} 
        options={{ tabBarLabel: 'Progress' }} 
      />
    </Tab.Navigator>
  );
};
