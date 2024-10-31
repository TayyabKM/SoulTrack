// navigation/RootNavigator.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../screens/SplashScreen';
import { auth } from '../services/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RootNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);

        // Store UID in AsyncStorage for persistence
        await AsyncStorage.setItem('userToken', authUser.uid);
      } else {
        setUser(null);

        // Remove token from AsyncStorage if logged out
        await AsyncStorage.removeItem('userToken');
      }
      setLoading(false); // Set loading to false once auth state is determined
    });

    return unsubscribe; // Clean up the listener on unmount
  }, []);

  // Show SplashScreen while loading
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
