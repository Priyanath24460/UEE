import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, Image, ScrollView, Animated } from 'react-native';
import { db } from '../../config/FirebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import * as Linking from 'expo-linking';
import { useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


interface Step {
  stepDescription: string;
  stepImageUrl: string;
}

interface RouteParams {
  situationId: string;
}

const Burn = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0)); // For step transition animation
  const [darkMode, setDarkMode] = useState(false); // Dark mode toggle
  const route = useRoute();
  const { situationId } = route.params as RouteParams;

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const q = query(
          collection(db, 'emergencySituations', situationId, 'firstAidSteps'),
          orderBy('order')
        );
        const querySnapshot = await getDocs(q);

        const fetchedSteps: Step[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedSteps.push({
            stepDescription: data.stepDescription,
            stepImageUrl: data.imageUrl.replace(/^'|'$/g, ''),
          });
        });

        if (fetchedSteps.length > 0) {
          setSteps(fetchedSteps);
          fadeIn();
        } else {
          Alert.alert('No steps found for the selected emergency situation.');
        }
      } catch (error) {
        console.error('Error fetching steps: ', error);
        Alert.alert('Error fetching steps, please try again.');
      }
    };

    fetchSteps();
  }, [situationId]);

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      fadeIn();
    } else {
      Alert.alert('You have completed all the steps!');
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      fadeIn();
    }
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:112');
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentStep = steps[currentStepIndex];

  return (
    
    <ScrollView contentContainerStyle={[styles.scrollViewContent, darkMode && styles.darkScrollViewContent]}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity onPress={toggleDarkMode} style={styles.toggleButton}>
          <MaterialCommunityIcons name={darkMode ? "weather-sunny" : "weather-night"} size={30} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {steps.length > 0 ? (
        <>
          <Text style={[styles.stepTitle, darkMode && styles.darkText]}>පියවර {currentStepIndex + 1} - {steps.length}</Text>

         
          <View style={styles.progressBarContainer}>
            <Text style={[styles.progressText, darkMode && styles.darkText]}>ප්‍රගතිය:</Text>
            <View style={styles.progressBar}>
              <View
                style={{
                  height: '100%',
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                  backgroundColor: '#3b5998',
                  borderRadius: 5,
                }}
              />
            </View>
          </View>

          <Animated.View style={{ opacity: fadeAnim }}>
            {currentStep.stepImageUrl && (
              <TouchableOpacity activeOpacity={0.8} onPress={() => Alert.alert('Zoom feature coming soon!')}>
                <Image
                  source={{ uri: currentStep.stepImageUrl }}
                  style={styles.stepImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            )}
            <Text style={[styles.stepDescription, darkMode && styles.darkText]}>{currentStep.stepDescription}</Text>
          </Animated.View>

         
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handlePreviousStep}
              style={[styles.circleButton, currentStepIndex === 0 && styles.disabledButton]}
              disabled={currentStepIndex === 0}
            >
              <MaterialCommunityIcons name="arrow-left" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextStep} style={styles.circleButton}>
              <MaterialCommunityIcons name="arrow-right" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

         
          <TouchableOpacity onPress={handleEmergencyCall} style={styles.emergencyButton}>
            <Text style={styles.emergencyButtonText}>හදිසි ඇමතුම්</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={[styles.noStepsMessage, darkMode && styles.darkText]}>No steps available.</Text>
      )}
    </ScrollView>
  
  
    
  );
};

export default Burn;

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e0f7fa',
  },
  darkScrollViewContent: {
    backgroundColor: '#333',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  stepDescription: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 10,
    color: '#555',
    fontWeight: '500',
  },
  stepImage: {
    width: 350,
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignSelf: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  progressBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '60%',
  },
  circleButton: {
    width: 80,
    height: 80,
    backgroundColor: '#007BFF',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  emergencyButton: {
    backgroundColor: '#ff0000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: 300,
  },
  emergencyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  noStepsMessage: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
  },
  toggleContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  toggleButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

