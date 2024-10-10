import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, Image, Alert } from 'react-native';
import { db } from '../../config/FirebaseConfig'; // Import your Firebase config
import { collection, doc, setDoc, addDoc } from "firebase/firestore";

// Type definitions for the emergency situation and steps
interface Step {
  stepDescription: string;
  stepImageUrl: string;
}

interface EmergencySituation {
  name: string;
  description: string;
  situationImageUrl: string;
  steps: Step[];
}

const AddEmergencySituationForm = () => {
  // State for the emergency situation
  const [situationName, setSituationName] = useState<string>('');
  const [situationDescription, setSituationDescription] = useState<string>('');
  const [situationImageUrl, setSituationImageUrl] = useState<string>('');

  // State for first aid steps (array of steps)
  const [steps, setSteps] = useState<Step[]>([{ stepDescription: '', stepImageUrl: '' }]);

  // Function to handle adding new steps
  const addStepField = () => {
    setSteps([...steps, { stepDescription: '', stepImageUrl: '' }]);
  };

  // Function to handle changing the values of a specific step
  const handleStepChange = (index: number, field: keyof Step, value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  // Function to submit the form
  const handleSubmit = async () => {
    if (!situationName || !situationDescription || !situationImageUrl) {
      Alert.alert('Please fill in all the fields for the emergency situation.');
      return;
    }

    try {
      const emergencyData: EmergencySituation = {
        name: situationName,
        description: situationDescription,
        situationImageUrl: situationImageUrl,
        steps: steps,
      };

      // 1. Add the emergency situation to Firestore
      const emergencySituationRef = doc(collection(db, 'emergencySituations'), situationName.toLowerCase());
      await setDoc(emergencySituationRef, {
        name: emergencyData.name,
        description: emergencyData.description,
        imageUrl: emergencyData.situationImageUrl,
      });

      // 2. Add first aid steps as a subcollection under the emergency situation
      const stepsCollectionRef = collection(emergencySituationRef, 'firstAidSteps');
      for (let index = 0; index < emergencyData.steps.length; index++) {
        const step = emergencyData.steps[index];
        if (step.stepDescription && step.stepImageUrl) {
          await addDoc(stepsCollectionRef, {
            stepDescription: step.stepDescription,
            imageUrl: step.stepImageUrl,
            order: index, // Add order field to maintain the sequence
          });
        }
      }

      Alert.alert('Emergency situation and steps added successfully!');
      // Clear form after submission
      setSituationName('');
      setSituationDescription('');
      setSituationImageUrl('');
      setSteps([{ stepDescription: '', stepImageUrl: '' }]);
    } catch (error) {
      console.error('Error submitting form: ', error);
      Alert.alert('Error adding emergency situation, please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Add Emergency Situation</Text>

      {/* Input for emergency situation name */}
      <TextInput
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
        placeholder="Situation Name"
        value={situationName}
        onChangeText={setSituationName}
      />

      {/* Input for emergency situation description */}
      <TextInput
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
        placeholder="Situation Description"
        value={situationDescription}
        onChangeText={setSituationDescription}
      />

      {/* Input for emergency situation image URL */}
      <TextInput
        style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
        placeholder="Situation Image URL"
        value={situationImageUrl}
        onChangeText={setSituationImageUrl}
      />

      {/* Display the image if the URL is valid */}
      {situationImageUrl ? (
        <Image source={{ uri: situationImageUrl }} style={{ width: 100, height: 100, marginVertical: 10 }} />
      ) : null}

      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Add First Aid Steps</Text>

      {steps.map((step, index) => (
        <View key={index} style={{ marginBottom: 20 }}>
          <TextInput
            style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
            placeholder={`Step ${index + 1} Description`}
            value={step.stepDescription}
            onChangeText={(text) => handleStepChange(index, 'stepDescription', text)}
          />

          <TextInput
            style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
            placeholder={`Step ${index + 1} Image URL`}
            value={step.stepImageUrl}
            onChangeText={(text) => handleStepChange(index, 'stepImageUrl', text)}
          />

          {/* Display the image for each step if the URL is valid */}
          {step.stepImageUrl ? (
            <Image source={{ uri: step.stepImageUrl }} style={{ width: 100, height: 100 }} />
          ) : null}
        </View>
      ))}

      <Button title="Add Another Step" onPress={addStepField} />
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default AddEmergencySituationForm;
