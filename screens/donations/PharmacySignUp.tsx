import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView, Image } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../../config/FirebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import RNPickerSelect from 'react-native-picker-select';

type PharmacySignUpNavigationProp = NavigationProp<RootStackParamList, 'PharmacySignUp'>;

const PharmacySignUp = () => {
    const navigation = useNavigation<PharmacySignUpNavigationProp>();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [license, setLicense] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Bank details state
  const [bank, setBank] = useState<string | null>(null);
  const [branch, setBranch] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolderName, setAccountHolderName] = useState<string>('');

  const bankOptions = [
    { label: 'Bank of Ceylon', value: 'BOC' },
    { label: 'Commercial Bank', value: 'COM' },
    { label: 'Hatton National Bank', value: 'HNB' },
    // Add more banks as needed
];

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
    if (!email.match(emailRegex)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return false;
    }
    if (!bank) {
        Alert.alert('Validation Error', 'Bank is required.');
        return false;
    }
    if (!branch.trim()) {
        Alert.alert('Validation Error', 'Branch is required.');
        return false;
    }
    if (!accountNumber.trim()) {
        Alert.alert('Validation Error', 'Account Number is required.');
        return false;
    }
    if (!accountHolderName.trim()) {
        Alert.alert('Validation Error', 'Account Holder Name is required.');
        return false;
    }
    return true;
  };

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!pickerResult.canceled && pickerResult.assets.length > 0) {
      setImage(pickerResult.assets[0].uri);
    } else {
      Alert.alert('Image selection canceled.');
    }
  };

  const uploadImage = async (uri: string) => {
    const storage = getStorage();
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `PharmacyLicenses/${Date.now()}`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const checkUserExists = async () => {
    const phoneQuery = query(collection(db, 'users'), where('phone', '==', phone));
    const phoneSnapshot = await getDocs(phoneQuery);
    if (!phoneSnapshot.empty) {
      Alert.alert('Validation Error', 'Phone number is already in use.');
      return false;
    }

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

    try {
        let uploadedImageUrl = null;
        if (image) {
            uploadedImageUrl = await uploadImage(image);
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store pharmacy data in 'pharmacies' collection
        await setDoc(doc(db, 'pharmacies', user.uid), {
            name,
            phone,
            email,
            address,
            license,
            imageUrl: uploadedImageUrl,
            bankDetails: {
                bank,
                branch,
                accountNumber,
                accountHolderName,
            },
        });

        // Store limited information in 'pharmacyDetails' collection
        await setDoc(doc(db, 'pharmacyPool', user.uid), {
            pharmacyId: user.uid,   // Pharmacy ID
            name,                   // Pharmacy name
            bankDetails: {
                bank,
                branch,
                accountNumber,
                accountHolderName,
            },
            amount: 0,             // Initialized attribute
        });

        Alert.alert('Registration successful', 'You have successfully registered as a pharmacy.');
        navigation.navigate('Login');

    } catch (error) {
        console.error('Registration failed:', error);
        Alert.alert('Registration failed', (error as Error).message);
    }
};


  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pharmacy Registration</Text>
        <Text style={styles.label}>Pharmacy Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Pharmacy Name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          value={address}
          onChangeText={setAddress}
        />

        <Text style={styles.label}>Pharmacy License Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter License Number"
          value={license}
          onChangeText={setLicense}
        />

        <Text style={styles.label}>Pharmacy License</Text>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text>Select License Image</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Bank</Text>
                <RNPickerSelect
                    onValueChange={(value: React.SetStateAction<string | null>) => setBank(value)}
                    items={bankOptions}
                    style={pickerSelectStyles}
                    placeholder={{ label: 'Select Bank', value: null }}
                />

                <Text style={styles.label}>Branch</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Branch Name"
                    value={branch}
                    onChangeText={setBranch}
                />

                <Text style={styles.label}>Account Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Account Number"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                />

                <Text style={styles.label}>Account Holder Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter Account Holder Name"
                    value={accountHolderName}
                    onChangeText={setAccountHolderName}
                />


        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Re-Enter Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 18,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#1b2785',
        borderRadius: 10,
        color: '#1b2785',
        marginBottom: 20,
    },
    inputAndroid: {
        fontSize: 18,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#1b2785',
        borderRadius: 10,
        color: '#1b2785',
        marginBottom: 20,
    },
});
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
    fontWeight: 'bold',
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
  label: {
    color: '#1b2785',
    fontSize: 20,
  },
  registerButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});

export default PharmacySignUp;
