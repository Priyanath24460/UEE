import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../../config/FirebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';

type PharmacySignUpNavigationProp = NavigationProp<RootStackParamList, 'PharmacySignUp'>;

interface RegisterProps {
    navigation: any;
}

const PharmacySignUp: React.FC<RegisterProps> = ({navigation}) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [phone, setPhone] = useState<string>('');

    const validatePassword = (password: string) => {
        // Check if password is less than 6 characters
        if (password.length < 6) {
          Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
          return false;
        }
    
        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
          Alert.alert('Validation Error', 'Password must contain at least one uppercase letter.');
          return false;
        }
    
        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
          Alert.alert('Validation Error', 'Password must contain at least one lowercase letter.');
          return false;
        }
    
        // Check for at least one number
        if (!/[0-9]/.test(password)) {
          Alert.alert('Validation Error', 'Password must contain at least one number.');
          return false;
        }
    
        // Check for at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          Alert.alert('Validation Error', 'Password must contain at least one special character.');
          return false;
        }
    
        // Check for whitespace
        if (/\s/.test(password)) {
          Alert.alert('Validation Error', 'Password must not contain any whitespace characters.');
          return false;
        }
    
        return true;
      };

    const validateForm = () => {
        if (!name.trim()) {
          Alert.alert('Validation Error', 'Name is required.');
          return false;
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phone.match(phoneRegex)) {
          Alert.alert('Validation Error', 'Please enter a valid phone number (10 digits).');
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidDomains = ['example.com', 'test.com'];
    
        if (!email.match(emailRegex)) {
          Alert.alert('Validation Error', 'Please enter a valid email address.');
          return false;
        }
    
        if (email.length > 254) {
          Alert.alert('Validation Error', 'Email address cannot exceed 254 characters.');
          return false;
        }
    
        const emailDomain = email.split('@')[1];
        if (invalidDomains.includes(emailDomain)) {
          Alert.alert('Validation Error', 'The provided email address is from a blocked domain.');
          return false;
        }
    
        if (/^[^a-zA-Z0-9]|[^a-zA-Z0-9]$/.test(email)) {
          Alert.alert('Validation Error', 'Email cannot start or end with special characters.');
          return false;
        }
    
        if (email.includes('..')) {
          Alert.alert('Validation Error', 'Email cannot contain consecutive dots.');
          return false;
        }
    
        // Call the password validation function
        if (!validatePassword(password)) {
          return false; // If password validation fails, stop the form validation
        }
        
        if (password !== confirmPassword) {
          Alert.alert('Validation Error', 'Passwords do not match.');
          return false;
        }
        return true;
      };

    const checkUserExists = async () => {
    
        // Check if the phone number already exists
        const phoneQuery = query(collection(db, 'users'), where('phone', '==', phone));
        const phoneSnapshot = await getDocs(phoneQuery);
        if (!phoneSnapshot.empty) {
          Alert.alert('Validation Error', 'Phone number is already in use.');
          return false;
        }
    
        // Check if the email already exists
        const emailQuery = query(collection(db, 'users'), where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          Alert.alert('Validation Error', 'Email address is already in use.');
          return false;
        }
    
        return true;
      };

      const handleRegister = async () => {
        if (!validateForm()) {
          return;
        }
    
        const userExists = await checkUserExists();
        if (!userExists) {
          return; // Stop registration if user exists
        }
    
        try {
          // Create user with email and password
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
    
          console.log('User registered:', user);
    
          // Create user document in Firestore with initial points and other details
          await setDoc(doc(db, 'pharmacy', user.uid), {
            name,
            phone,
            email,
            address,
            location: {
              latitude: null,
              longitude: null,
            },
          });
    
          Alert.alert('Registration successful', 'You have successfully registered.');
          navigation.navigate('Login'); // Redirect to Login page after registration
        } catch (error) {
          console.error('Registration failed:', error);
          Alert.alert('Registration failed', (error as Error).message);
        }
      };

      return (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Name"
              value={name}
              onChangeText={setName}
            />
            
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Address"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-Enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
              <Text style={styles.loginButtonText}>Register</Text>
            </TouchableOpacity>
            
            
          </ScrollView>
        </View>  
      );
    };
    const styles = StyleSheet.create({
        container: {
          justifyContent: 'center',
          padding: 20,
          width: 350,
          marginLeft: 35,
          marginTop: 20,
          borderWidth: 2,
          borderColor: '#1b2785',
          borderRadius: 30,
        },
        title: {
          fontSize: 50,
          marginBottom: 20,
          textAlign: 'center',
          color: '#1b2785',
          fontWeight: 'bold'
        },
        input: {
          height: 50,
          borderColor: '#1b2785',
          borderWidth: 1,
          marginBottom: 20,
          paddingHorizontal: 10,
          color: '#1b2785',
          borderRadius: 10, 
          fontSize: 18,
        },
        qrContainer: {
          marginTop: 20,
          alignItems: 'center',
        },
        label: {
          color: '#1b2785',
          fontSize: 20,
        },
        loginButton: {
          backgroundColor: '#1E90FF',
          paddingVertical: 15,
          borderRadius: 10,
          marginTop: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        },
        loginButtonText: {
          color: '#fff',
          fontSize: 20,
          textAlign: 'center',
          fontWeight: 'bold',
        },
      });

    export default PharmacySignUp;



