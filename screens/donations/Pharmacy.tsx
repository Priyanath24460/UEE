import { View , Text, Alert, TextInput, StyleSheet, Button } from "react-native"
import React, { useState } from "react";
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { db } from '../../config/FirebaseConfig'
import { collection, addDoc } from "firebase/firestore";

type PharmacyNavigationProp = NavigationProp<RootStackParamList, 'Pharmacy'>;

const Pharmacy = () => {
    const navigation = useNavigation<PharmacyNavigationProp>();

    //inputs
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    //handle submit
    const handleSubmit = async () => {
        try {
            const docRef = await addDoc(collection(db, 'Pharmacy'), {
                name: name,
                address: address,
            });

            Alert.alert("Data uploaded successfully!");
            console.log("Document ID: ", docRef.id); // Log the generated document ID
            setName('');
            setAddress('');
        } catch (error) {
            console.error("Error uploading data: ", error);
            Alert.alert('Error uploading data')
        }
    }

    return (
        <View>
            <Text>Pharmacy</Text>
            <TextInput
                placeholder="name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="address"
                value={address}
                onChangeText={setAddress}
            />
            <Button
                title="Submit"
                onPress={handleSubmit}
            />
        </View>
    )
}

export default Pharmacy;
