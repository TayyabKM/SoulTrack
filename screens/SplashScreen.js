// screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simulate loading process (e.g., checking user authentication)
    const timer = setTimeout(() => {
      // Use navigation.replace to avoid going back to SplashScreen
      navigation.replace('Login'); // or navigate to 'Map' if authenticated
    }, 2000);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SoulTrack</Text>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SplashScreen;
