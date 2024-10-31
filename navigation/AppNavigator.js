// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import OtherUserProfileScreen from '../screens/OtherUserProfileScreen'; 
import ConnectionsScreen from '../screens/ConnectionsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      {/* TabNavigator is the main navigation with bottom tabs */}
      <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
      
      {/* OtherUserProfileScreen is for viewing profiles of other users, navigated from SearchScreen */}
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} options={{ title: 'User Profile' }} />
      <Stack.Screen 
        name="Connections" 
        component={ConnectionsScreen} 
        options={{ title: 'Connections' }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
