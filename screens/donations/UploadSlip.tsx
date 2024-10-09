// Upload.tsx
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet, Button } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { db } from '../../config/FirebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TextInput } from "react-native-gesture-handler";

type UploadNavigationProp = NavigationProp<RootStackParamList, 'Upload'>;

type UploadRouteProp = RouteProp<RootStackParamList, 'Upload'>;

const Upload = ({ route }: { route: UploadRouteProp }) => {
    const navigation = useNavigation<UploadNavigationProp>();
    
    // Extract pharmacy ID and name from route params
    const { id: pharmacyId, name: pharmacyName } = route.params;

    // Inputs
    const [name, setName] = useState('');
    const [phoneno, setPhoneno] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    // Image selection from gallery
    const pickImage = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission to access camera roll is required!");
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

    // Upload image to Firebase
    const uploadImage = async (uri: string | URL | Request) => {
        const storage = getStorage();
        const response = await fetch(uri);
        const blob = await response.blob();

        const storageRef = ref(storage, `uploads/${Date.now()}`);

        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        return url;
    };

    const handleSubmit = async () => {
        try {
            let uploadedImageUrl = null;
            if (image) {
                uploadedImageUrl = await uploadImage(image);
            }

            // Adding document to Firebase collection with pharmacy ID reference
            await addDoc(collection(db, 'Donations'), {
                name: name,
                phoneno: phoneno,
                imageUrl: uploadedImageUrl,
                pharmacyId: pharmacyId,  // Reference to the pharmacy ID
                timestamp: new Date(),
            });

            Alert.alert("Data and image uploaded successfully!");
            setName('');
            setPhoneno('');
            setImage(null);
        } catch (error) {
            console.error("Error uploading data: ", error);
            Alert.alert('Error uploading data or image.');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <Text style={styles.headerText}>{pharmacyName}</Text>
            
            {/* Amount Section */}
            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>රු.5000.00</Text>
            </View>
            
            {/* Input Form Section */}
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Input Text"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Input Phone Number"
                    value={phoneno}
                    onChangeText={setPhoneno}
                />

                {/* Image Preview */}
                {image && <Image source={{ uri: image }} style={styles.image} />}

                {/* Pick Image Button */}
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text>Select Image</Text>
                </TouchableOpacity>
            </View>
            
            {/* Submit button */}
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#b3e5fc',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    amountContainer: {
        backgroundColor: '#e0f7fa',
        padding: 10,
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 10,
    },
    amountText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d32f2f',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
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

export default Upload;
