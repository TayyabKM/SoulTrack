// screens/UserProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const UserProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);  // Loading state
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        console.log("Current User UID:", currentUser.uid); // Log the UID

        try {
          // Retrieve the user document using the current user's ID
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data());
            console.log("User Data Retrieved:", docSnap.data());
          } else {
            Alert.alert('Error', 'User data not found');
            console.log("Document not found for UID:", currentUser.uid);
          }
        } catch (error) {
          Alert.alert('Error', error.message);
          console.error("Error fetching user data:", error.message);
        } finally {
          setLoading(false);  // Stop loading after fetching data
        }
      } else {
        setLoading(false); // Stop loading if no current user
        console.log("No current user");
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // Redirect to login screen after logout
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading your profile...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Error: Unable to load profile data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.info}>Name: {userData.name}</Text>
      <Text style={styles.info}>Username: {userData.username}</Text>
      <Text style={styles.info}>Email: {userData.email}</Text>
      <Button title="Logout" onPress={handleLogout} />
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

export default UserProfileScreen;
