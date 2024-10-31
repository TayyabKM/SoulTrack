// screens/SearchScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Please enter a username to search.");
      return;
    }

    try {
      const q = query(collection(db, 'users'), where('username', '==', searchQuery));
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (users.length === 0) {
        Alert.alert("No users found.");
      }

      setResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error searching users:", error.message);
    }
  };

  const handleUserSelect = (user) => {
    // Navigate to OtherUserProfileScreen with user details
    navigation.navigate('OtherUserProfile', { user });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserSelect(item)}>
      <Text style={styles.userName}>{item.name || item.username}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Users</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter username"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <Button title="Search" onPress={handleSearch} />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.noResults}>No results found</Text>}
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
    marginBottom: 10,
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
  userItem: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default SearchScreen;
