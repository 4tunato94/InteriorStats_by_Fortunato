import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChartBar as BarChart3, Users, Settings, History } from 'lucide-react-native';
import { View, Text, StyleSheet } from 'react-native';
import AnalysisSetup from './index';
import TeamsScreen from './teams';
import ActionsScreen from './actions';
import HistoryScreen from './history';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#888',
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen 
          name="index"
          options={{
            title: 'Análise',
            tabBarIcon: ({ size, color }) => (
              <BarChart3 size={size} color={color} />
            ),
          }}
          component={AnalysisSetup}
        />
        <Tab.Screen 
          name="teams"
          options={{
            title: 'Times',
            tabBarIcon: ({ size, color }) => (
              <Users size={size} color={color} />
            ),
          }}
          component={TeamsScreen}
        />
        <Tab.Screen 
          name="actions"
          options={{
            title: 'Ações',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
          component={ActionsScreen}
        />
        <Tab.Screen 
          name="history"
          options={{
            title: 'Histórico',
            tabBarIcon: ({ size, color }) => (
              <History size={size} color={color} />
            ),
          }}
          component={HistoryScreen}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderTopColor: '#333',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});