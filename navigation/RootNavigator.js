// navigation/RootNavigator.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../screens/SplashScreen'; // Import the SplashScreen here if you want to show it during loading
import { auth } from '../services/firebaseConfig';

const RootNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
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
