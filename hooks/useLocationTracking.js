import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { auth, db } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const useLocationTracking = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const currentUserUid = auth.currentUser?.uid; // Current user’s UID

  useEffect(() => {
    const requestLocationPermission = async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      // Get the device's current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);  // Save coordinates (latitude & longitude)

      // Update the location in Firestore
      if (currentUserUid) {
        await setDoc(doc(db, 'users', currentUserUid), {
          location: {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          },
        }, { merge: true });  // Merge to avoid overwriting other fields
      }
    };

    requestLocationPermission();
  }, [currentUserUid]);

  return { location, error };
};

export default useLocationTracking;
