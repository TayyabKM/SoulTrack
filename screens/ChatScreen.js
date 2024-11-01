// screens/ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';

const ChatScreen = ({ route }) => {
  const { connectionUserId } = route.params; // The ID of the user you’re chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUserId = auth.currentUser.uid;

  // Generate a unique chat ID based on user IDs
  const chatId = [currentUserId, connectionUserId].sort().join('_'); 

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    // Listen for real-time updates to messages
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: currentUserId,
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.message,
            item.senderId === currentUserId ? styles.myMessage : styles.theirMessage
          ]}>
            <Text>{item.text}</Text>
          </View>
        )}
        inverted // Scroll to the latest message
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  message: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C5', // light green
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA', // light grey
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default ChatScreen;
