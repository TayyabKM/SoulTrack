// screens/AllConnectionsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';

const AllConnectionsScreen = ({ navigation }) => {
  const [connections, setConnections] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    // Real-time listener for the current user's connections
    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const connectionsList = userData.connections || [];

        // Fetch detailed data for each connection
        const connectionDetails = [];
        for (const connectionId of connectionsList) {
          const connectionDoc = await getDoc(doc(db, 'users', connectionId));
          if (connectionDoc.exists()) {
            connectionDetails.push({
              id: connectionId,
              ...connectionDoc.data(),
            });
          }
        }
        setConnections(connectionDetails);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDisconnect = async (connectionId) => {
    try {
      const currentUserDocRef = doc(db, 'users', currentUser.uid);
      const otherUserDocRef = doc(db, 'users', connectionId);

      // Remove the connection from both users
      await updateDoc(currentUserDocRef, {
        connections: arrayRemove(connectionId),
      });
      await updateDoc(otherUserDocRef, {
        connections: arrayRemove(currentUser.uid),
      });

      // Update the local state immediately
      setConnections((prevConnections) => prevConnections.filter((item) => item.id !== connectionId));

      Alert.alert('Disconnected', 'You are no longer connected with this user.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Connections</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Connections')}>
        <Text style={styles.link}>Connection Requests</Text>
      </TouchableOpacity>
      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.connectionContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('OtherUserProfile', { userId: item.id })}
            >
              <Text>{item.name}</Text>
              <Text>{item.email}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={() => handleDisconnect(item.id)}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No connections found</Text>}
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
  link: {
    color: '#1E90FF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  connectionContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default AllConnectionsScreen;
