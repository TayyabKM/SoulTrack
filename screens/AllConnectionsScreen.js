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

  const handleChat = (connectionId, connectionName) => {
    navigation.navigate('Chat', { connectionUserId: connectionId, connectionUserName: connectionName });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Connections</Text>

      {/* Button to view Connection Requests */}
      <TouchableOpacity
        style={styles.requestsButton}
        onPress={() => navigation.navigate('Connections')}
      >
        <Text style={styles.requestsButtonText}>Connection Requests</Text>
      </TouchableOpacity>

      <FlatList
        data={connections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.connectionContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('OtherUserProfile', { userId: item.id })}
              style={styles.connectionDetails}
            >
              <Text style={styles.connectionName}>{item.name}</Text>
              <Text style={styles.connectionEmail}>{item.email}</Text>
            </TouchableOpacity>
            
            {/* Chat button */}
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => handleChat(item.id, item.name)}
            >
              <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>

            {/* Disconnect button */}
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
  requestsButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  requestsButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  connectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  connectionDetails: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectionEmail: {
    fontSize: 14,
    color: '#555',
  },
  chatButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginRight: 10,
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
