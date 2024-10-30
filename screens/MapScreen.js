// screens/MapScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { auth } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';

const MapScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('AuthNavigator'); // Redirect to AuthNavigator on logout
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Map Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;
