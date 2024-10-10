// Upload.tsx
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet, Button } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { db } from '../../config/FirebaseConfig';
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TextInput } from "react-native-gesture-handler";
import { getAuth } from "firebase/auth";

type UploadNavigationProp = NavigationProp<RootStackParamList, 'Upload'>;

type UploadRouteProp = RouteProp<RootStackParamList, 'Upload'>;

const Upload = ({ route }: { route: UploadRouteProp }) => {
    const navigation = useNavigation<UploadNavigationProp>();
    
    // Extract pharmacy ID and name from route params
    const { id: pharmacyId, name: pharmacyName, amount: donationAmount } = route.params;

    //bank details
    const [bankDetails, setBankDetails] = useState<{ accountNumber: string, bankName: string, branch: string } | null>(null);

    // Inputs
    const [name, setName] = useState('');
    const [phoneno, setPhoneno] = useState('');
    const [donation, setDonation] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
    //fetch
    React.useEffect(() => {
        const fetchBankDetails = async () => {
            try{
                const docRef = doc(db, 'pharmacies', pharmacyId);
                const docSnap = await getDoc(docRef);

                if(docSnap.exists()){
                    const data = docSnap.data();
                    setBankDetails(data.bankDetails);
                }else{
                    console.log("No such document!");
                }
            }catch(error){
                console.error("Error fetching bank details:", error);
            }
        };
        fetchBankDetails();
    }, [pharmacyId]);

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
            const auth = getAuth();
            const user = auth.currentUser;
    
            if (!user) {
                Alert.alert("You need to be logged in to upload a slip");
                return;
            }
    
            const userId = user.uid;
            let uploadedImageUrl = null;
    
            if (image) {
                uploadedImageUrl = await uploadImage(image);
            }
    
            // Save donation data to temporary collection until approved
            const pendingDonationRef = collection(db, 'PendingDonations');
            const docRef = await addDoc(pendingDonationRef, {
                name: name,
                phoneno: phoneno,
                donation: donation,
                imageUrl: uploadedImageUrl,
                pharmacyId: pharmacyId,
                userId: userId,
                timestamp: new Date(),
            });
    
            // Fetch the pharmacy's push token from Firestore
            const pharmacyDocRef = doc(db, 'pharmacies', pharmacyId);
            const pharmacyDocSnap = await getDoc(pharmacyDocRef);
    
            if (pharmacyDocSnap.exists()) {
                const pharmacyData = pharmacyDocSnap.data();
                const pharmacyPushToken = pharmacyData?.pushToken;
    
                if (pharmacyPushToken) {
                    // Send notification to the pharmacy to approve the donation
                    await sendPushNotification(pharmacyPushToken, name, donation);
                }
            } else {
                console.log("No such pharmacy document!");
            }
    
            Alert.alert("Donation submitted for approval!");
            setName('');
            setPhoneno('');
            setDonation('');
            setImage(null);
    
        } catch (error) {
            console.error("Error uploading data: ", error);
            Alert.alert('Error uploading data or image.');
        }
    };
    
    // Modify the sendPushNotification function as needed
    const sendPushNotification = async (expoPushToken: string, donorName: string, donationAmount: string) => {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: 'New Donation Pending Approval',
            body: `${donorName} has submitted a donation of ${donationAmount}. Please review it.`,
            data: { donationAmount, donorName },
        };
    
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    };
    

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <Text style={styles.headerText}>{pharmacyName}</Text>
            
            {/* Amount Section */}
            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>රු.{donationAmount.toFixed(2)}</Text>
            </View>
            
            {/* Input Form Section */}
            <View style={styles.formContainer}>
                <Text>Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Input Name"
                    value={name}
                    onChangeText={setName}
                />
                <Text>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Input Phone Number"
                    value={phoneno}
                    onChangeText={setPhoneno}
                />

                <Text>Donation Amount</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Input Donation amount"
                    value={donation}
                    onChangeText={setDonation}
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
