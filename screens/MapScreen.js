import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { auth, db } from '../services/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import useLocationTracking from '../hooks/useLocationTracking';

const MapScreen = () => {
  const { location, error } = useLocationTracking();  // Track own location
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocations, setUserLocations] = useState([]);

  useEffect(() => {
    if (location) {
      setRegion({
        ...region,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
    if (error) {
      Alert.alert('Error', error);
    }
  }, [location, error]);

  // Listen to other users' locations in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const locations = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.location && doc.id !== auth.currentUser?.uid) {  // Exclude current user
          locations.push({
            id: doc.id,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            name: data.name || 'Unknown User',  // Optional: add a name field in Firestore
          });
        }
      });
      setUserLocations(locations);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} showsUserLocation={true}>
        {/* Show other users’ markers */}
        {userLocations.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            title={user.name}
          />
        ))}
      </MapView>
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
