// screens/OtherUserProfile.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const OtherUserProfile = ({ route }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          Alert.alert('Error', 'User not found');
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    fetchUserData();
  }, [userId]);

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{userData.name}'s Profile</Text>
      <Text>Username: {userData.username}</Text>
      <Text>Email: {userData.email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default OtherUserProfile;
