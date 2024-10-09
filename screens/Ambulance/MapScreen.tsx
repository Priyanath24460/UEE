import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Footer from '@/layouts/Footer'; // Import Footer component

interface MapScreenProps {
  navigation: StackNavigationProp<any>; // You can replace 'any' with a specific type if you have defined your stack
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const [region, setRegion] = useState({
    latitude: 6.3419566746559, // Default latitude
    longitude: 80.23699545098775, // Default longitude
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
          return;
        }
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setRegion({ ...region, latitude, longitude });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ගිලන්රථ සොයන්න</Text>

      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true} // Show user's location on the map
      >
        {/* Marker for User Location */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="This is where you are"
          />
        )}
      </MapView>

      {/* Notification Icon */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => navigation.navigate('NotificationScreen')} // Navigate to your notification screen
      >
        <Ionicons name="notifications-outline" size={30} color="#007BFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => navigation.navigate('FindAmbulanceScreen')}
      >
        <Text style={styles.buttonText}>සොයන්න</Text>
      </TouchableOpacity>

      {/* Include Footer at the bottom */}
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '70%',
  },
  notificationButton: {
    position: 'absolute',
    top: 50, // Adjust as needed
    right: 20, // Adjust as needed
    zIndex: 1, // Ensure it appears above other components
  },
  searchButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    marginTop: -5,
    width:300
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 35,
    textAlign:'center'
  },
});

export default MapScreen;
