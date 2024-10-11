import { View, Text, Alert, Image, TouchableOpacity, StyleSheet, Button, ScrollView, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { db } from '../../config/FirebaseConfig';
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TextInput } from "react-native-gesture-handler";
import { getAuth } from "firebase/auth";
import { LinearGradient } from 'expo-linear-gradient';

type UploadNavigationProp = NavigationProp<RootStackParamList, 'Upload'>;

type UploadRouteProp = RouteProp<RootStackParamList, 'Upload'>;

const Upload = ({ route }: { route: UploadRouteProp }) => {
    const navigation = useNavigation<UploadNavigationProp>();
    
    // Extract pharmacy ID and name from route params
    const { id: pharmacyId, name: pharmacyName, amount: donationAmount } = route.params;

    //bank details
    const [bankDetails, setBankDetails] = useState<{ accountNumber: string, bank: string, branch: string } | null>(null);

    // Inputs
    const [name, setName] = useState('');
    const [phoneno, setPhoneno] = useState('');
    const [donation, setDonation] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
    //fetch
    React.useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const docRef = doc(db, 'pharmacies', pharmacyId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBankDetails(data.bankDetails);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
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
                status: 'pending', // Add status field to track donation status
                timestamp: new Date(),
            });
    
            // After form submission, navigate to status screen
            navigation.navigate('StatusScreen', { donationId: docRef.id, status: 'pending' });

    
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
        <LinearGradient
                colors={['#007791', '#ffffff']} // Start with the first color, then transition to the second color
                style={styles.backgroundGradient}
                locations={[0, 0.80]} // Control where the first color ends and second begins (50% point)
        >
            {/* Scrollable Section */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
            
            {/* Header Section */}
            <Text style={styles.headerText}>{pharmacyName}</Text>
            
            {/* Amount Section */}
            <View style={styles.amountContainer}>
                <Text style={styles.amountText}>රු.{donationAmount}</Text>
            </View>

            {/* Bank Details Section */}
            <View style={styles.bankDetailsContainer}>
                {bankDetails ? (
                    <>
                        <Text style={styles.bankDetailText}>බැංකුව : {bankDetails.bank}</Text>
                        <Text style={styles.bankDetailText}>බැංකු ශාඛාව : {bankDetails.branch}</Text>
                        <Text style={styles.bankDetailText}>ගිණුම් අංකය : {bankDetails.accountNumber}</Text>
                    </>
                ) : (
                    <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0018A8" />
                    <Text>Loading ...</Text>
                    </View>
                )}
            </View>
        </View>
        <View style={styles.container2}>    
            {/* Input Form Section */}
            <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>නම</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Input Name"
                    value={name}
                    onChangeText={setName}
                />
                <Text style={styles.inputLabel}>දුරකතන අංකය
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Input Phone Number"
                    value={phoneno}
                    onChangeText={setPhoneno}
                    keyboardType="number-pad"
                />

                <Text style={styles.inputLabel}>පරිත්‍යාග මුදල
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Input Donation amount"
                    value={donation}
                    onChangeText={setDonation}
                />

                {/* Image Preview */}
                {image && <Image source={{ uri: image }} style={styles.image} />}

                {/* Pick Image Button */}
                <Text style={styles.inputLabel}>බැංකු රිසිට්පත
                </Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text>රිසිට්පත තෝරා ගැනීමට
                    </Text>
                </TouchableOpacity>
                {/* Submit button */}
                <View style={styles.SubmitButtonc}>
                <TouchableOpacity style={styles.SubmitButton} onPress={handleSubmit}>
                    <Text style={{color: '#ffffff', fontWeight: 'bold', fontSize: 18,}}>යොමු කරන්න
                    </Text>
                </TouchableOpacity>
                </View>
            </View>
            
        </View>
        </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    container2: {
        padding: 0,
    },
    backgroundGradient: {
        marginTop:0,
        marginBottom: 20,
        flex: 1,
    },
    headerText: {
        fontSize: 20,
        color:'white',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    amountContainer: {
        backgroundColor: 'rgba(224, 247, 250, 0.4)',
        padding: 10,
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 40,
    },
    amountText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d32f2f',
    },
    //# , 
    bankDetailsContainer: {
        marginBottom: 20,
        backgroundColor: '#A3C1AD',
        padding: 15,
        borderRadius: 20,
        shadowColor:'black',
        shadowOpacity:0.5,
    },
    bankDetailText: {
        fontSize: 18,
        marginBottom: 3,
        fontWeight:'bold'
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 40,
        marginBottom: 20,
        width: '100%',
        shadowOpacity:0.5,
        paddingHorizontal: 50
    },
    inputLabel:{
        fontSize: 18,
        paddingBottom:10,
        fontWeight: 'bold',
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
    SubmitButton: {
        alignItems: 'center',
        backgroundColor: '#007791',
        color:'#ffffff',
        width: 100,
        padding: 10,
        borderRadius: 15,
        fontSize: 20,
    },
    SubmitButtonc: {
        alignItems: 'center',
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
});

export default Upload;
