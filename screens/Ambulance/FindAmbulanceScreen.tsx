import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'; 
import * as Linking from 'expo-linking'; 
import { FontAwesome } from '@expo/vector-icons';

// Define the Ambulance type
interface Ambulance {
  id: string;
  name: string;
  vicinity: string;
  contactNumber: string;
  available: boolean;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  distance?: number; 
}

const FindAmbulanceScreen = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  
  const [nearestAmbulances, setNearestAmbulances] = useState<Ambulance[]>([]);

  // Sample ambulance data
  const ambulances: Ambulance[] = [
    {
      id: '1',
      name: 'සුව සැරිය',
      vicinity: 'Main Street, Pitigala.',
      contactNumber: '1990',
      available: true,
      geometry: {
        location: {
          lat: 6.3419566746559,
          lng: 80.23699545098775,
        },
      },
    },
    {
      id: '2',
      name: 'අසනීප සෙවන',
      vicinity: '11 mile post, Amugoda.',
      contactNumber: '1988',
      available: false,
      geometry: {
        location: {
          lat: 6.321350462192045,
          lng: 80.21910933281846,
        },
      },
    },
    {
      id: '3',
      name: 'Ambulance 1990',
      vicinity: 'Mapalagama Rd, Maththaka.',
      contactNumber: '112',
      available: true,
      geometry: {
        location: {
          lat: 6.308415867742713,
          lng: 80.24822530703422,
        },
      },
    },
    {
      id: '4',
      name: 'සහන සැරිය',
      vicinity: 'Weliwita Rd, Malabe.',
      contactNumber: '112',
      available: true,
      geometry: {
        location: {
          lat: 6.9164379521187485,
          lng: 79.97083215559165,
        },
      },
    },

    {
      id: '5',
      name: 'Ambulance 1990',
      vicinity: 'Gemunupura Rd,2nd Lane , Malabe.',
      contactNumber: '1990',
      available: true,
      geometry: {
        location: {
          lat: 6.916770188683331,
          lng: 79.97455596422226,
        },
      },
    },
    {
      id: '6',
      name: 'සුව සැරිය',
      vicinity: 'Kaduwela Rd , Pittugala.',
      contactNumber: '1988',
      available: true,
      geometry: {
        location: {
          lat: 6.910390652272332,
          lng: 79.97179915352022,
        },
      },
    },
    {
      id: '7',
      name: 'අසනීප සෙවන',
      vicinity: 'Kaduwela Rd , Kothalawala.',
      contactNumber: '118',
      available: false,
      geometry: {
        location: {
          lat: 6.919737177290993,
          lng: 79.97560630485096,
        },
      },
    },
   
  ];

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Function to get the user's current location
  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Unable to access location');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const userLat = currentLocation.coords.latitude;
      const userLng = currentLocation.coords.longitude;

      setLocation({
        latitude: userLat,
        longitude: userLng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Filter and sort ambulances based on distance
      const filteredAmbulances = ambulances
        .map((ambulance) => ({
          ...ambulance,
          distance: calculateDistance(
            userLat,
            userLng,
            ambulance.geometry.location.lat,
            ambulance.geometry.location.lng
          ),
        }))
        .filter((ambulance) => ambulance.distance! <= 10)
        .sort((a, b) => a.distance! - b.distance!);

      setNearestAmbulances(filteredAmbulances);

    } catch (error) {
      console.log('Error fetching location:', error);
      Alert.alert('Error', 'Failed to get your location');
    }
  };

  // Function to handle contact button press
  const handleContact = (contactNumber: string) => {
    Linking.openURL(`tel:${contactNumber}`);
  };

  // Function to handle getting directions
  const handleGetDirections = (ambulance: Ambulance) => {
    if (location) {
      const { latitude, longitude } = location;
      const destinationLat = ambulance.geometry.location.lat;
      const destinationLng = ambulance.geometry.location.lng;
      const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
      Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Location not available.');
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Nearby Ambulances</Text>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={location}
          showsUserLocation={true}
        >
          {nearestAmbulances.map((ambulance) => (
            <Marker
              key={ambulance.id}
              coordinate={{
                latitude: ambulance.geometry.location.lat,
                longitude: ambulance.geometry.location.lng,
              }}
              title={ambulance.name}
              description={ambulance.vicinity}
            />
          ))}
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}

      <FlatList
        data={nearestAmbulances}
        renderItem={({ item }) => (
          <View
            style={[
              styles.ambulanceItem,
              item.available ? styles.availableBorder : styles.unavailableBorder,
            ]}
          >
            <Text style={styles.ambulanceName}>{item.name}</Text>
            <Text style={styles.ambulanceVicinity}>{item.vicinity}</Text>
            <Text>Distance: {item.distance!.toFixed(2)} km</Text>
            <Text style={styles.contactNumber}>Contact: {item.contactNumber}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.contactButton,
                  !item.available && styles.disabledButton,
                ]}
                onPress={() => item.available && handleContact(item.contactNumber)}
                disabled={!item.available}
              >
                <FontAwesome name="phone" size={20} color="#fff" />
                <Text style={styles.contactButtonText}>
                  {item.available ? 'අමතන්න' : 'ලබාගත නොහැක'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.directionsButton,
                  !item.available && styles.disabledButton,
                ]}
                onPress={() => item.available && handleGetDirections(item)}
                disabled={!item.available}
              >
                <FontAwesome name="map" size={20} color="#fff" />
                <Text style={styles.directionsButtonText}>
                  {item.available ? 'දිශාව ලබා ගන්න' : 'Not Available'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
  },
  map: {
    width: '100%',
    height: 400,
  },
  ambulanceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  availableBorder: {
    borderWidth: 2,
    borderColor: 'green', // Green border for available ambulances
  },
  unavailableBorder: {
    borderWidth: 2,
    borderColor: 'red', // Red border for unavailable ambulances
  },
  ambulanceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ambulanceVicinity: {
    fontSize: 14,
  },
  contactNumber: {
    fontSize: 14,
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  contactButton: {
    backgroundColor: '#007BFF',
    padding: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    width: 230,
  },
  disabledButton: {
    backgroundColor: 'gray', // Gray out the button for unavailable ambulances
    opacity: 0.7, // Make it visually distinct as disabled
  },
  directionsButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  contactButtonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize:20,
    fontWeight:'bold'
  },
  directionsButtonText: {
    color: '#fff',
  },
});

export default FindAmbulanceScreen;
