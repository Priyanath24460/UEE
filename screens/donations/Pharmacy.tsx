import { View, Text, Alert, Button, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { db } from '../../config/FirebaseConfig';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from 'firebase/auth';

// Define the Donation type
type Donation = {
    id: string;
    name: string;
    phoneno: string;
    donation: string;
    imageUrl?: string; // optional, as it may not always be provided
};

// Define the PharmacyData type
type PharmacyData = {
    id: string;
    name: string;
    phone: string;
    address: string;
    bankDetails: {
        bank: string;
        branch: string;
        accountNumber: string;
        accountHolderName: string;
    };
};

type PharmacyNavigationProp = NavigationProp<RootStackParamList, 'Pharmacy'>;
type PharmacyProps = {
    route: RouteProp<RootStackParamList, 'Pharmacy'>; // specify the route type
    navigation: StackNavigationProp<RootStackParamList, 'Pharmacy'>; // specify the navigation type
};

const Pharmacy: React.FC<PharmacyProps> = ({ route }) => {
    const navigation = useNavigation<PharmacyNavigationProp>();
  
    // Extract pharmacy data from route params
    const { pharmacyData } = route.params;
    
    const [pendingDonation, setPendingDonations] = useState<Donation[]>([]); // specify state type

    const auth = getAuth();

    // Fetch pending donations
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'PendingDonations'), (snapshot) => {
            const donationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Donation[]; // specify the type
            setPendingDonations(donationsData);
        });
        return () => unsubscribe();
    }, []);

    const handleApprove = async (donationId: string, donationData: Donation) => {
        try {
            // Add the donation to the Donations collection
            await addDoc(collection(db, 'Donations'), donationData);

            // Remove from PendingDonations
            await deleteDoc(doc(db, 'PendingDonations', donationId)); // delete the donation from pending donations
            
            Alert.alert("Donation approved!");
        } catch (error) {
            console.error("Error approving donation: ", error);
            Alert.alert("Error approving donation.");
        }
    };

    const handleReject = async (donationId: string) => {
        try {
            // Implement deletion of the pending donation
            await deleteDoc(doc(db, 'PendingDonations', donationId)); // delete the donation from pending donations
            
            Alert.alert("Donation rejected.");
        } catch (error) {
            console.error("Error rejecting donation: ", error);
            Alert.alert("Error rejecting donation.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pharmacy Details</Text>
            <Text>Name: {pharmacyData.name}</Text>
            <Text>Phone: {pharmacyData.phone}</Text>
            <Text>Address: {pharmacyData.address}</Text>
            <Text>Bank: {pharmacyData.bankDetails.bank}</Text>
            <Text>Branch: {pharmacyData.bankDetails.branch}</Text>
            <Text>Account Number: {pharmacyData.bankDetails.accountNumber}</Text>
            <Text>Account Holder: {pharmacyData.bankDetails.accountHolderName}</Text>
            <View style={styles.container}>
                <Text style={styles.headerText}>Pending Donations</Text>
                {pendingDonation.length === 0 ? (
                    <Text>No pending donations</Text>
                ) : (
                    pendingDonation.map(donation => (
                        <View key={donation.id} style={styles.donationCard}>
                            <Text>Name: {donation.name}</Text>
                            <Text>Phone: {donation.phoneno}</Text>
                            <Text>Donation: {donation.donation}</Text>
                            {donation.imageUrl && <Image source={{ uri: donation.imageUrl }} style={styles.image} />}
                            <View style={styles.buttonContainer}>
                                <Button title="Approve" onPress={() => handleApprove(donation.id, donation)} />
                                <Button title="Reject" onPress={() => handleReject(donation.id)} />
                            </View>
                        </View>
                    ))
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    donationCard: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 10,
    },
});

export default Pharmacy;
