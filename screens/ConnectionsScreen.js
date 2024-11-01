// screens/ConnectionsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

const ConnectionsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = auth.currentUser;

  // Real-time listener setup
  useEffect(() => {
    if (!currentUser) return;

    // Real-time listener for pending requests in the current user's document
    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const pendingRequests = userData.pendingRequests || [];
        const requestDetails = [];

        for (const requestId of pendingRequests) {
          const requestUserDoc = await getDoc(doc(db, 'users', requestId));
          if (requestUserDoc.exists()) {
            requestDetails.push({
              id: requestId,
              ...requestUserDoc.data(),
            });
          }
        }

        setRequests(requestDetails);
        setLoading(false);
      } else {
        setRequests([]);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [currentUser]);

  const handleAccept = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        connections: arrayUnion(userId),
        pendingRequests: arrayRemove(userId),
      });

      const otherUserDocRef = doc(db, 'users', userId);
      await updateDoc(otherUserDocRef, {
        connections: arrayUnion(currentUser.uid),
      });

      Alert.alert('Request Accepted', 'You are now connected.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDecline = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        pendingRequests: arrayRemove(userId),
      });

      Alert.alert('Request Declined');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Pull-to-refresh function
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false); // End refreshing after short delay
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading connection requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.requestContainer}>
            <Text style={styles.requestText}>{item.name}</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleAccept(item.id)}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleDecline(item.id)}>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No connection requests</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  requestContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  requestText: {
    fontSize: 16,
    flex: 1,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default ConnectionsScreen;
