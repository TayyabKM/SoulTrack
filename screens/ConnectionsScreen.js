// screens/ConnectionsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList } from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const ConnectionsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Real-time listener for the current user's document
    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const pendingRequests = userData.connectionRequests || [];
        const requestDetails = [];

        // Fetch each user's data for pending requests
        const fetchRequests = async () => {
          const details = [];
          for (const requestId of pendingRequests) {
            const requestUserDoc = await getDoc(doc(db, 'users', requestId));
            if (requestUserDoc.exists()) {
              details.push({
                id: requestId,
                ...requestUserDoc.data(),
              });
            }
          }
          setRequests(details);
          setLoading(false);
        };

        fetchRequests();
      } else {
        setRequests([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAccept = async (userId) => {
    try {
      // Add each user to each other’s connections list and remove the request
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        connections: arrayUnion(userId),
        connectionRequests: arrayRemove(userId),
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
        connectionRequests: arrayRemove(userId),
      });

      Alert.alert('Request Declined');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
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
