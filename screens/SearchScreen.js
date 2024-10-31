// screens/SearchScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

const SearchScreen = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Fetch the connection status for each user in the search results
  const fetchConnectionStatus = async (otherUserId) => {
    const currentUserUid = auth.currentUser.uid;
    const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
    const currentUserDoc = await getDoc(doc(db, 'users', currentUserUid));
    
    if (otherUserDoc.exists() && currentUserDoc.exists()) {
      const otherUserData = otherUserDoc.data();
      const currentUserData = currentUserDoc.data();

      const isPendingRequest = otherUserData.pendingRequests?.includes(currentUserUid);
      const isConnected = currentUserData.connections?.includes(otherUserId);

      return { isPendingRequest, isConnected };
    }
    return { isPendingRequest: false, isConnected: false };
  };

  const handleSearch = async () => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', searchTerm));
    const querySnapshot = await getDocs(q);
    
    const results = [];
    for (const docSnap of querySnapshot.docs) {
      const userData = docSnap.data();
      const userId = docSnap.id;
      if (userId !== auth.currentUser.uid) {
        const { isPendingRequest, isConnected } = await fetchConnectionStatus(userId);
        results.push({ id: userId, ...userData, isPendingRequest, isConnected });
      }
    }
    setSearchResults(results);
  };

  const handleConnect = async (userId, isPendingRequest, isConnected) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const currentUserUid = auth.currentUser.uid;

      if (isConnected) {
        await updateDoc(userDocRef, {
          connections: arrayRemove(currentUserUid)
        });
        await updateDoc(doc(db, 'users', currentUserUid), {
          connections: arrayRemove(userId)
        });
        Alert.alert('Disconnected', 'You are no longer connected.');
      } else if (isPendingRequest) {
        await updateDoc(userDocRef, {
          pendingRequests: arrayRemove(currentUserUid)
        });
        Alert.alert('Request Canceled', 'You have unsent the connection request.');
      } else {
        await updateDoc(userDocRef, {
          pendingRequests: arrayUnion(currentUserUid)
        });
        Alert.alert('Request Sent', 'Connection request has been sent!');
      }

      handleSearch(); // Refresh search results to reflect new connection state
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Navigate to the other user's profile
  const viewUserProfile = (userId) => {
    navigation.navigate('OtherUserProfile', { userId });
  };

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
        renderItem={({ item }) => (
          <View style={styles.resultContainer}>
            <TouchableOpacity onPress={() => viewUserProfile(item.id)}>
              <Text style={styles.userText}>{item.name}</Text>
            </TouchableOpacity>
            <Text>{item.email}</Text>
            <TouchableOpacity
              onPress={() => handleConnect(item.id, item.isPendingRequest, item.isConnected)}
              style={styles.connectButton}
            >
              <Text style={styles.buttonText}>
                {item.isConnected ? 'Disconnect' : item.isPendingRequest ? 'Unsend' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
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
  userText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginRight: 10,
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
