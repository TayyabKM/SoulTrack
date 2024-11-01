// screens/ChatScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { db, auth } from '../services/firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

const ChatScreen = ({ route, navigation }) => {
  const { connectionUserId, connectionUserName } = route.params; // Pass connection user data from navigation
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = auth.currentUser;

  // Dynamically generate chat ID based on both user IDs
  const chatId = currentUser.uid < connectionUserId
    ? `${currentUser.uid}_${connectionUserId}`
    : `${connectionUserId}_${currentUser.uid}`;

  // Listen to messages for this chat ID
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
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
      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
          text: newMessage,
          senderId: currentUser.uid,
          timestamp: new Date(),
        });

        setNewMessage('');
      } catch (error) {
        Alert.alert('Error sending message', error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted // Show latest message at the bottom
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.senderId === currentUser.uid ? styles.myMessage : styles.theirMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: '#DCF8C5',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#fff',
  },
});

export default ChatScreen;
