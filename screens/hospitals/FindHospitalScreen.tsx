import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Define types for the location coordinates
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Define types for each hospital
interface Hospital {
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
}

const FindHospitalScreen: React.FC = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    (async () => {
      let currentLocation = await getUserLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        let nearbyHospitals = await findHospitals(currentLocation.latitude, currentLocation.longitude);
        if (nearbyHospitals) {
          let hospitalsWithDistance = await addRoadDistances(
            currentLocation.latitude,
            currentLocation.longitude,
            nearbyHospitals
          );

          hospitalsWithDistance.sort((a, b) => {
            const distanceA = parseFloat(a.roadDistance?.replace(' km', '') || '0');
            const distanceB = parseFloat(b.roadDistance?.replace(' km', '') || '0');
            return distanceA - distanceB;
          });

          setHospitals(hospitalsWithDistance);
        }
      }
    })();
  }, []);

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

  const findHospitals = async (latitude: number, longitude: number): Promise<Hospital[] | undefined> => {
    const apiKey = 'AIzaSyCtV803a3BAeHMRNxe0QVsQxC83ZGHO16k'; 
    const radius = 5000;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${apiKey}`;

    try {
      let response = await fetch(url);
      let data = await response.json();
      
      const hospitals = await Promise.all(data.results.map(async (hospital: any) => {
        const phoneNumber = await fetchHospitalDetails(hospital.place_id);
        return {
          ...hospital,
          phoneNumber,
        };
      }));

      return hospitals as Hospital[];
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHospitalDetails = async (placeId: string): Promise<string | undefined> => {
    const apiKey = 'AIzaSyCtV803a3BAeHMRNxe0QVsQxC83ZGHO16k'; 
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${apiKey}`;

    try {
      let response = await fetch(url);
      let data = await response.json();
      return data.result?.formatted_phone_number || 'N/A';
    } catch (error) {
      console.error(error);
      return 'N/A';
    }
  };

  const addRoadDistances = async (
    userLat: number,
    userLng: number,
    hospitals: Hospital[]
  ): Promise<Hospital[]> => {
    const apiKey = 'AIzaSyCtV803a3BAeHMRNxe0QVsQxC83ZGHO16k';
    const destinations = hospitals
      .map(
        (hospital) =>
          `${hospital.geometry.location.lat},${hospital.geometry.location.lng}`
      )
      .join('|');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${destinations}&mode=driving&key=${apiKey}`;

    try {
      let response = await fetch(url);
      let data = await response.json();

      return hospitals.map((hospital, index) => {
        const distance = data.rows[0].elements[index].distance?.text || 'N/A';
        return { ...hospital, roadDistance: distance };
      });
    } catch (error) {
      console.error(error);
      return hospitals;
    }
  };

  const renderHospitalItem = ({ item }: { item: Hospital }) => (
    <TouchableOpacity style={styles.hospitalItem}>
      <Text style={styles.hospitalName}>{item.name}</Text>
      <Text>{item.vicinity}</Text>
      <Text>Distance: {item.roadDistance}</Text>
      <Text>Contact: {item.phoneNumber}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {location ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Hospitals Nearby</Text>
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
              pinColor="green"
            />

            {hospitals.map((hospital, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: hospital.geometry.location.lat,
                  longitude: hospital.geometry.location.lng,
                }}
                title={hospital.name}
                description={hospital.vicinity}
              />
            ))}
          </MapView>

          <FlatList
            data={hospitals}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderHospitalItem}
            style={styles.hospitalList}
          />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  map: {
    width: '100%',
    height: '40%',
    borderRadius: 20,
    marginTop: 10,
  },
  hospitalList: {
    width: '100%',
    height: '60%',
    paddingHorizontal: 10,
  },
  hospitalItem: {
    backgroundColor: '#80deea',
    borderRadius: 10,
    marginVertical: 10,
    padding: 20,
  },
  hospitalName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default FindHospitalScreen;
