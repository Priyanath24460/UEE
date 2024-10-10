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
        navigation.navigate('Home');
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
      <Text style={styles.title}>Login</Text>

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
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
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
});

export default Login;
