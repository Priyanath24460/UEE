import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../config/FirebaseConfig'; // Import Firebase auth and Firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';

type RegisterScreenNavigationProp = NavigationProp<RootStackParamList, 'Register'>;

const Register = () => {
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    // Validation
    if (!name || !nic || !mobile || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user data object
      const userData = {
        uid: user.uid,
        name,
        nic,
        mobile,
        email,
      };

      // Save user data in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);
      
      Alert.alert('Success', 'User registered successfully!');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register user.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>ලියාපදිංචි කරන්න</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="NIC"
          value={nic}
          onChangeText={setNic}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
        />
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
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>ලියාපදිංචි කරන්න</Text>
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
    borderWidth: 2, // Transparent border
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Slightly transparent form background
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
  halfCircle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50, // Adjust the height as needed
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    backgroundColor: '#fff', // The color of the half-circle
  },
});

export default Register;
