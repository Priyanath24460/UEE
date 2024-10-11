import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from '../config/FirebaseConfig'; // Firebase config
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';

// Define the type for pharmacy data
type PharmacyData = {
  id: string;
  name: string;
  address: string;
  phone: string; 
        bankDetails: { 
            bank: string; 
            branch: string; 
            accountNumber: string; 
            accountHolderName: string; 
        } 
} | null;

type LoginNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginNavigationProp>();

  // Function to get pharmacy data
  const getPharmacyData = async (uid: string): Promise<PharmacyData> => {
    const pharmacyRef = doc(db, 'pharmacies', uid); // Adjust the document path as necessary
    const pharmacyDoc = await getDoc(pharmacyRef);

    if (pharmacyDoc.exists()) {
      return {
        id: pharmacyDoc.id,
        ...(pharmacyDoc.data() as { 
          name: string; 
          address: string; 
          phone: string;
          bankDetails: { 
            bank: string; 
            branch: string; 
            accountNumber: string; 
            accountHolderName: string; 
        }  
        }), // Ensure it matches expected type
      };
    } else {
      return null; // Return null if no pharmacy found
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      // Firebase authentication sign-in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check the users collection first
      const userDoc = await getDoc(doc(db, 'users', user.uid)); // Adjust collection name as needed
      if (userDoc.exists()) {
        navigation.navigate('MapScreen');
      } else {
        // If not found in users, check the pharmacy collection
        const pharmacyData = await getPharmacyData(user.uid); // Fetch pharmacy data
        if (pharmacyData) {
          navigation.navigate('Pharmacy', { pharmacyData }); // Navigate to Pharmacy
        } else {
          Alert.alert('Error', 'User data not found in both collections.');
        }
      }

    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welocome}>සාදරයෙන් පිළිගනිමු !</Text>
      <View style={styles.formContainer}>
        <Text style={styles.title}>පිවිසුම</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>ඇතුල් වන්න</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>ගිණුමක් නැද්ද? ලියාපදිංචි කරන්න</Text>
        </TouchableOpacity>
      </View>
      {/* Half-circle at the bottom of the page */}
      <View style={styles.halfCircle} />
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ADD8E6', // Light blue background color
  },
  formContainer: {
    borderWidth: 2, // Set border width
    borderColor: 'rgba(255, 255, 255, 0.5)', // Transparent border
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Slightly transparent background for the form
    elevation: 5, // Add shadow (for Android)
    shadowColor: '#000', // Add shadow (for iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom:150
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  registerText: {
    color: '#108292',
    fontWeight: 'bold',
  },
  halfCircle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // Adjust the height as needed
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    backgroundColor: '#fff', // The color of the half-circle
  },
  welocome: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 150, // Adds space between the welcome text and form
    textAlign: 'center',
    color:'blue'
  },
});

export default Login;
