import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ImageBackground, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/FirebaseConfig'; // Adjust path as needed
import { Ionicons } from '@expo/vector-icons'; // Import icons

interface LoginProps {
  navigation: any;
}

const PharmacyLogin: React.FC<LoginProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setPasswordVisibility] = useState<boolean>(false); // State for password visibility

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //   console.log('User logged in:', userCredential.pharmacy);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login failed', (error as Error).message);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!isPasswordVisible); // Toggle the visibility
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Image source={require('../assets/images/bg1.png')} style={styles.logo} />
          <Text style={styles.vVolunteer}>Pharmacy</Text>
          <Text style={styles.vlogin}>Login</Text>
          

          <View style={styles.container}>
            
            <Text style={styles.lable}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Enter your Email"
              autoCapitalize="none"
            />
            <Text style={styles.lable}>Password</Text>

            {/* Password input with toggle icon */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible} // Toggle secureTextEntry based on state
                placeholder="Enter your password"
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'} // Toggle eye icon
                  size={24}
                  color="#1b2785"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerText}>Don't have an account? Create one</Text>
            </TouchableOpacity>
          </View>
          <Image source={require('../assets/images/loginbt.png')} style={styles.loginbt} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  vlogin: {
    color: '#ffffff',
    fontSize: 40,
    marginTop: -10,
    marginLeft: 50,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  vVolunteer:{
    color: '#ffffff',
    fontSize: 45,
    marginTop: -130,
    marginLeft: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  container: {
    justifyContent: 'center',
    padding: 20,
    width: 350,
    height: 400,
    marginLeft: 35,
    marginBottom: 110,
    borderWidth: 2,
    borderColor: '#1b2785',
    borderRadius: 10,
    marginTop: 100,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#1b2785',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    height: 50, // Match height to the input
  },
  passwordInput: {
    flex: 1, // Take up the remaining space
    paddingHorizontal: 10,
    color: '#1b2785',
    fontSize: 18,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  registerText: {
    marginTop: 20,
    color: '#1b2785',
    textAlign: 'center',
  },
  lable: {
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
  appName: {
    fontSize: 70,
    color: '#1b2785',
    marginBottom: 20,
    marginLeft: 70,
    fontStyle: 'italic',
    fontWeight: 'bold',
    marginTop: 50,
  },
  logo: {
    width: 300,
    height: 140,
    alignSelf: 'auto',
    marginBottom: 20,
  },
  loginbt: {
    width: '100%',
    height: 130,
    alignSelf: 'auto',
    marginTop: -60,
  },
});

export default PharmacyLogin;
