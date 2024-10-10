import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, TextInput, StyleSheet } from 'react-native';
import { db } from '../../config/FirebaseConfig'; // Import your Firebase config
import { collection, getDocs } from "firebase/firestore";
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import useNavigation and NavigationProp
import { RootStackParamList } from '../../navigation/StackNavigator'; // Update the path to your navigation file

interface EmergencySituation {
  id: string;
  name: string;
  imageUrl: string;
  description: string; // Include the description field
}

const Medicine = () => {
  const [emergencySituations, setEmergencySituations] = useState<EmergencySituation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for the search query
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Specify the type

  const fetchEmergencySituations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'emergencySituations'));
      const situations: EmergencySituation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        situations.push({
          id: doc.id,
          name: data.name,
          imageUrl: data.imageUrl,
          description: data.description || "", // Safely access description
        });
      });
      console.log('Fetched emergency situations: ', situations); // Log the fetched situations
      setEmergencySituations(situations);
    } catch (error) {
      console.error('Error fetching emergency situations: ', error);
      Alert.alert('Error fetching emergency situations, please try again later.');
    }
  };

  useEffect(() => {
    fetchEmergencySituations();
  }, []);

  // Filter the emergency situations based on the search query
  const filteredSituations = emergencySituations.filter(situation =>
    situation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.outerContainer}>
      <Text style={styles.title}>හදිසි අවස්ථා</Text>

      {/* Search Bar */}
      <TextInput
        placeholder="සොයන්න..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredSituations.length > 0 ? (
          filteredSituations.map((situation) => (
            <TouchableOpacity
              key={situation.id}
              style={styles.card}
              onPress={() => {
                // Navigate to Burn component and pass the emergency situation details
                navigation.navigate('Burn', { situationId: situation.id });
              }}
            >
              {situation.imageUrl ? (
                <Image
                  source={{ uri: situation.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                  onError={() => console.log('Failed to load image:', situation.imageUrl)}
                />
              ) : null}
              <View style={styles.textContainer}>
                <Text style={styles.cardText}>{situation.name}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyMessage}>No results found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Medicine;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1, // Ensures the View takes up the full height
    backgroundColor: '#e0f7fa', // Light blue background color
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 20, // Adds some padding to avoid cutting off the last card
    flexGrow: 1, // Allows scrolling by growing the content as needed
  },
  title: {
    fontWeight: 'bold',
    fontSize: 26,
    marginTop: 20, // Add some space above the title
    marginBottom: 10,
    color: '#00796b', // Deep teal color for the title
    textAlign: 'center',
  },
  searchBar: {
    height: 40,
    borderColor: '#00838f', // Blue border for the search bar
    borderWidth: 1,
    borderRadius: 20, // Rounded corners for a modern look
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderRadius: 15, // More rounded corners for the cards
    padding: 20,
    marginVertical: 10,
    width: '100%', // Takes full width of the screen
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 6,
    borderColor: '#00acc1', // Accent color for card
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 22, // Increased font size for better readability
    color: '#004d40', // Dark green text for the card
    fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#00796b', // Teal color for empty message
    marginTop: 20,
    textAlign: 'center',
  },
});
