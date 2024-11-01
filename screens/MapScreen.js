import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Button, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { auth, db } from '../services/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import useLocationTracking from '../hooks/useLocationTracking';

const MapScreen = () => {
  const { location, error } = useLocationTracking();
  const [region, setRegion] = useState({
    latitude: 37.7749, // Default location (San Francisco)
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (location) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
    if (error) {
      Alert.alert('Error', error);
    }
  }, [location, error]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const connectionIds = userData.connections || [];

        const connectionListeners = connectionIds.map((connectionId) => 
          onSnapshot(doc(db, 'users', connectionId), (connectionDocSnap) => {
            if (connectionDocSnap.exists()) {
              const connectionData = connectionDocSnap.data();
              const { latitude, longitude } = connectionData.location || {};

              if (latitude !== undefined && longitude !== undefined) {
                setConnections((prevConnections) => {
                  const updatedConnections = prevConnections.filter(conn => conn.id !== connectionId);
                  updatedConnections.push({
                    id: connectionId,
                    name: connectionData.name || 'Connection',
                    latitude,
                    longitude,
                  });
                  return updatedConnections;
                });
              }
            } else {
              console.warn(`Connection user document for ${connectionId} does not exist.`);
            }
          })
        );

        return () => connectionListeners.forEach(unsub => unsub());
      }
    });

    return () => unsubscribe();
  }, []);

  const goToConnectionLocation = (connection) => {
    if (connection) {
      setRegion({
        latitude: connection.latitude,
        longitude: connection.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      Alert.alert("Connection's location not available");
    }
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map} 
        region={region} 
        onRegionChangeComplete={setRegion} 
        showsUserLocation={true}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Your Location"
            description="You are here"
          />
        )}

        {connections.map((connection) => (
          <Marker
            key={connection.id}
            coordinate={{ latitude: connection.latitude, longitude: connection.longitude }}
            title={connection.name}
            description={`${connection.name}'s last known location`}
          >
            {/* Custom icon with specific size */}
            <Image
              source={require('../assets/location.png')}
              style={{ width: 40, height: 40 }}  // Set desired icon size here
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>

      {connections.map((connection) => (
        <Button
          key={connection.id}
          title={`Go to ${connection.name}'s Location`}
          onPress={() => goToConnectionLocation(connection)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
