// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import OtherUserProfileScreen from '../screens/OtherUserProfileScreen'; 
import ConnectionsScreen from '../screens/ConnectionsScreen';
import AllConnectionsScreen from '../screens/AllConnectionsScreen'; 
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="AllConnections" component={AllConnectionsScreen} options={{ title: 'All Connections' }} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} options={{ title: 'User Profile' }} />
      <Stack.Screen name="Connections" component={ConnectionsScreen} options={{ title: 'Connection Requests' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.connectionUserName || 'Chat' })} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
