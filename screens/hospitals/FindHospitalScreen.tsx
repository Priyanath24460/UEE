// FindHospitalScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Linking, // Import Linking for dialing
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import HospitalDetailsModal from '../../components/HospitalDetailsModal'; // Import the modal
import { MaterialIcons } from '@expo/vector-icons';
import Footer from '@/layouts/Footer';



interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Place {
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  vicinity: string;
  roadDistance?: string;
  phoneNumber?: string;
  openingHours?: {
    openNow: boolean;
    weekdayText?: string[];
  };
}

const FindHospitalScreen: React.FC = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [placeType, setPlaceType] = useState<'hospital' | 'pharmacy' | 'both'>('both'); // Add state to track type selection
  const [title, setTitle] = useState('සියල්ල'); // Add title state

  useEffect(() => {
    (async () => {
      let currentLocation = await getUserLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        let nearbyPlaces = await findPlaces(currentLocation.latitude, currentLocation.longitude, placeType);
        if (nearbyPlaces) {
          let placesWithDistance = await addRoadDistances(currentLocation.latitude, currentLocation.longitude, nearbyPlaces);

          placesWithDistance.sort((a, b) => {
            const openA = a.openingHours?.openNow ? 0 : 1; // open items first
            const openB = b.openingHours?.openNow ? 0 : 1; // open items first
            const distanceA = parseFloat(a.roadDistance?.replace(' km', '') || '0');
            const distanceB = parseFloat(b.roadDistance?.replace(' km', '') || '0');
            return openA - openB || distanceA - distanceB; // Sort by open status and then by distance
          });

          setPlaces(placesWithDistance);
        }
      }
    })();
  }, [placeType]); // Fetch data when placeType changes

  const getUserLocation = async (): Promise<Coordinates | null> => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return null;
    }
    let location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const findPlaces = async (latitude: number, longitude: number, type: string): Promise<Place[] | undefined> => {
    const apiKey = 'AIzaSyCtV803a3BAeHMRNxe0QVsQxC83ZGHO16k';  // Replace with your Google API key
    const radius = 5000;
    const types = type === 'both' ? 'hospital|pharmacy' : type;  // Handle both selection
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${types}&key=${apiKey}`;

    try {
      let response = await fetch(url);
      let data = await response.json();

      const places = await Promise.all(data.results.map(async (place: any) => {
        const details = await fetchPlaceDetails(place.place_id);
        return {
          ...place,
          phoneNumber: details?.phoneNumber || 'N/A',
          openingHours: details?.openingHours ? details.openingHours : { openNow: false, weekdayText: [] },
        };
      }));

      return places as Place[];
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPlaceDetails = async (placeId: string): Promise<{ phoneNumber?: string, openingHours?: { openNow: boolean, weekdayText?: string[] } } | undefined> => {
    const apiKey = 'AIzaSyCtV803a3BAeHMRNxe0QVsQxC83ZGHO16k'; // Replace with your Google API key
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,opening_hours&key=${apiKey}`;

    try {
      let response = await fetch(url);
      let data = await response.json();

      return {
        phoneNumber: data.result?.formatted_phone_number || 'N/A',
        openingHours: data.result?.opening_hours ? {
          openNow: data.result.opening_hours.open_now,
          weekdayText: data.result.opening_hours.weekday_text,
        } : undefined,
        
      };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const addRoadDistances = async (userLat: number, userLng: number, places: Place[]): Promise<Place[]> => {
    const apiKey = 'AIzaSyCtV803a3BAeHMRNxe0QVsQxC83ZGHO16k'; // Replace with your Google API key
    const destinations = places
      .map((place) => `${place.geometry.location.lat},${place.geometry.location.lng}`)
      .join('|');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${destinations}&mode=driving&key=${apiKey}`;

    try {
      let response = await fetch(url);
      let data = await response.json();

      return places.map((place, index) => {
        const distance = data.rows[0].elements[index].distance?.text || 'N/A';
        return { ...place, roadDistance: distance };
      });
    } catch (error) {
      console.error(error);
      return places;
    }
  };

  const handleCall = (phoneNumber: string | undefined) => {
    if (phoneNumber && phoneNumber !== 'N/A') {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      alert('No phone number available to call.');
    }
  };

  const handleGetLocation = (place: Place) => {
    const lat = place.geometry.location.lat;
    const lng = place.geometry.location.lng;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const renderPlaceItem = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.placeItem}
      onPress={() => {
        setSelectedPlace(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.name}</Text>
        <Text>{item.vicinity}</Text>
        <Text>දුර: {item.roadDistance}</Text>
        <Text>දුරකථන අංකය: {item.phoneNumber}</Text>
        <View style={styles.twobutton}>
          <TouchableOpacity onPress={() => handleCall(item.phoneNumber)} style={styles.callButton}>
            <MaterialIcons name="phone" size={24} color="#ffffff" style={styles.callicon} />
            <Text style={styles.callButtonText}>ඇමතුම</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleGetLocation(item)} style={styles.locationButton}>
            <MaterialIcons name="place" size={24} color="#ffffff" style={styles.callicon} />
            <Text style={styles.locationButtonText}>ස්ථානය</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.openorNot}>
        <Text style={item.openingHours?.openNow ? styles.openText : styles.closedText}>
          {item.openingHours?.openNow ? 'විවෘතයි' : 'වසා ඇත'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {location ? (
        <>
          <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => {setPlaceType('hospital');setTitle('රෝහල්')}}>
                <Text style={styles.buttonText}>රෝහල්</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => {setPlaceType('pharmacy');setTitle('ෆාමසි')}}>
                <Text style={styles.buttonText}>ෆාමසි</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => {setPlaceType('both');setTitle('සියල්ල')}}>
                <Text style={styles.buttonText}>සියල්ල</Text>
              </TouchableOpacity>
            </View>
          </View>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              pinColor="blue"
            />

            {places.map((place, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: place.geometry.location.lat,
                  longitude: place.geometry.location.lng,
                }}
                title={place.name}
                description={place.vicinity}
              />
            ))}
          </MapView>

          <FlatList
  data={places}
  keyExtractor={(item) => item.place_id}  // Use a unique key for each item
  renderItem={renderPlaceItem}
  style={styles.placeList}
/>


          <HospitalDetailsModal
            selectedHospital={selectedPlace}  // Corrected prop name
            modalVisible={modalVisible}       // Pass modal visibility state
            setModalVisible={setModalVisible} // Pass setter for modal visibility
          />
        </>
      ) : (
        <Text>Loading...</Text>
      )}

<View style={styles.footerContainer}>
        <Footer />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
  },
  header: {
    backgroundColor: '#4dd0e1',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  openorNot:{
     marginTop:-110,
    
  },
  twobutton:{
    flexDirection: 'row',
    
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // or 'space-between'
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5, // Optional: Adds horizontal margin
    backgroundColor: '#3f6eef', // Example background color
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center text horizontally
    padding: 10, // Add some padding for better touch experience
    // 3D effect using shadow properties
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 2, // Vertical shadow
    },
    shadowOpacity: 0.25, // Opacity of shadow
    shadowRadius: 3.5, // Blurriness of shadow
    elevation: 5, // Android shadow effect
  },
  buttonText: {
    color: '#ffffff', // Text color
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: '40%',
    borderRadius: 20,
    marginTop: 10,
    borderWidth:1
  },
  placeInfo: {
    flex: 1, // Make this take the available space
  },
  placeList: {
    width: '100%',
    height: '60%',
    paddingHorizontal: 10,
    borderWidth:3,
    borderTopWidth:10,

    borderColor:'#108292',
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
  },
  placeItem: {
    backgroundColor: '#80deea',
    borderRadius: 10,
    marginVertical: 10,
    padding: 20,
    flexDirection: 'row', // Make it row for placing open indicator
    justifyContent: 'space-between', // Space between name and open indicator
    alignItems: 'center', // Center align items vertically
     // 3D effect using shadow properties
     shadowColor: '#000', // Shadow color
     shadowOffset: {
       width: 0,
       height: 2, // Vertical shadow
     },
     shadowOpacity: 0.25, // Opacity of shadow
     shadowRadius: 3.5, // Blurriness of shadow
     elevation: 5, // Android shadow effect
  },
  callicon:{
    marginRight:15
  },
  callButton: {
    marginTop: 5,
    backgroundColor: '#359759', // Main background color
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row', // Align icon and text in a row
    alignItems: 'center', // Center the icon and text vertically
    justifyContent: 'center', // Center the content
    width: 150,
    // 3D effect using shadow properties
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 2, // Vertical shadow
    },
    shadowOpacity: 0.25, // Opacity of shadow
    shadowRadius: 3.5, // Blurriness of shadow
    elevation: 5, // Android shadow effect
  },
  
  callButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize:20
  },
  placeName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },

  locationButton: {
    marginTop: 5,
    backgroundColor: '#eb6e26',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width:150,
    flexDirection: 'row', // Align icon and text in a row
    // Center the icon and text vertically
    justifyContent: 'center', 
    marginLeft:20,
    // 3D effect using shadow properties
    shadowColor: '#000', // Shadow color
    shadowOffset: {
      width: 0,
      height: 2, // Vertical shadow
    },
    shadowOpacity: 0.25, // Opacity of shadow
    shadowRadius: 3.5, // Blurriness of shadow
    elevation: 5, // Android shadow effect
  },
  locationButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize:20
    
  },
  openText: {
    fontSize: 16,
    color: '#ffffff', 
    backgroundColor:'green',// Color for open status
    fontWeight: 'bold',
    borderWidth:1,
    
    paddingLeft:13,
    paddingRight:10,
    paddingTop: 6,
    paddingBottom:3,
    borderRadius:20,
    borderColor:'green'
  },
  closedText: {
    fontSize: 16,
    color: '#ffffff', 
    backgroundColor:'red',
    fontWeight: 'bold',
    borderWidth:1,
    paddingHorizontal:10,
    paddingVertical:3,
    borderRadius:20,
    borderColor:'red'
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '91%',
    backgroundColor:'#108292',
  },
});

export default FindHospitalScreen;
