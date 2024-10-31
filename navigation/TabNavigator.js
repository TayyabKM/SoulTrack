// navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/UserProfileScreen';
import SearchScreen from '../screens/SearchScreen';


const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Hide header to only show bottom tabs
        tabBarLabelStyle: { fontSize: 12 }, // Customize label font size
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: 'Map' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
