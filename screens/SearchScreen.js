// screens/SearchScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';

const SearchScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const currentUserUid = auth.currentUser?.uid;

  // Real-time listener for current user's connection status
  useEffect(() => {
    if (!currentUserUid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', currentUserUid), (docSnap) => {
      if (docSnap.exists()) {
        const currentUserData = docSnap.data();
        
        // Update each search result's connection status in real-time
        setSearchResults((prevResults) =>
          prevResults.map((item) => {
            const isConnected = currentUserData.connections?.includes(item.id) || false;
            const isPendingRequest = currentUserData.pendingRequests?.includes(item.id) || false;
            return { ...item, connectionStatus: { isConnected, isPendingRequest } };
          })
        );
      }
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', searchTerm));
    const querySnapshot = await getDocs(q);

    const results = [];
    for (const docSnap of querySnapshot.docs) {
      const userData = docSnap.data();
      const userId = docSnap.id;
      if (userId !== currentUserUid) { // Exclude current user from search results
        const isConnected = userData.connections?.includes(currentUserUid) || false;
        const isPendingRequest = userData.pendingRequests?.includes(currentUserUid) || false;
        results.push({ id: userId, ...userData, connectionStatus: { isConnected, isPendingRequest } });
      }
    }
    setSearchResults(results);
  };

  const handleConnect = async (userId, connectionStatus) => {
    const { isPendingRequest, isConnected } = connectionStatus;

    try {
      const userDocRef = doc(db, 'users', userId);
      const currentUserDocRef = doc(db, 'users', currentUserUid);

      if (isConnected) {
        // Disconnect the user
        await updateDoc(userDocRef, {
          connections: arrayRemove(currentUserUid),
        });
        await updateDoc(currentUserDocRef, {
          connections: arrayRemove(userId),
        });
        Alert.alert('Disconnected', 'You are no longer connected.');
      } else if (isPendingRequest) {
        // Unsend the connection request
        await updateDoc(userDocRef, {
          pendingRequests: arrayRemove(currentUserUid),
        });
        Alert.alert('Request Canceled', 'You have unsent the connection request.');
      } else {
        // Send a connection request
        await updateDoc(userDocRef, {
          pendingRequests: arrayUnion(currentUserUid),
        });
        Alert.alert('Request Sent', 'Connection request has been sent!');
      }

      // Refresh connection status after action
      handleSearch();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handleSearch(); // Refresh the search results
    setRefreshing(false);
  }, [searchTerm]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Users</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <Button title="Search" onPress={handleSearch} />
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultContainer}
            onPress={() => navigation.navigate('OtherUserProfile', { userId: item.id })} // Navigate to OtherUserProfile
          >
            <View>
              <Text>{item.name}</Text>
              <Text>{item.email}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleConnect(item.id, item.connectionStatus)}
              style={styles.connectButton}
            >
              <Text style={styles.buttonText}>
                {item.connectionStatus.isConnected
                  ? 'Disconnect'
                  : item.connectionStatus.isPendingRequest
                  ? 'Unsend'
                  : 'Connect'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No results found</Text>}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  connectButton: {
    backgroundColor: '#1E90FF',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default SearchScreen;
