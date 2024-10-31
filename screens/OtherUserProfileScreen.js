// screens/OtherUserProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OtherUserProfileScreen = ({ route }) => {
  const { user } = route.params; // Get user data passed from SearchScreen

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{user.name || user.username}'s Profile</Text>
      <Text style={styles.info}>Username: {user.username}</Text>
      <Text style={styles.info}>Email: {user.email}</Text>
      {/* Add any other details or options here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
});

export default OtherUserProfileScreen;
