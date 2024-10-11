import { View, Text, Alert, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { db } from '../../config/FirebaseConfig';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from 'firebase/auth';
import Footer from '@/layouts/Footer';

type Donation = {
    id: string;
    name: string;
    phoneno: string;
    donation: string;
    imageUrl?: string;
};

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
    route: RouteProp<RootStackParamList, 'Pharmacy'>;
    navigation: StackNavigationProp<RootStackParamList, 'Pharmacy'>;
};

const Pharmacy: React.FC<PharmacyProps> = ({ route }) => {
    const navigation = useNavigation<PharmacyNavigationProp>();
    const { pharmacyData } = route.params;
    
    const [pendingDonation, setPendingDonations] = useState<Donation[]>([]);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'PendingDonations'), (snapshot) => {
            const donationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Donation[];
            setPendingDonations(donationsData);
        });
        return () => unsubscribe();
    }, []);

    const handleApprove = async (donationId: string, donationData: Donation) => {
        try {
            await addDoc(collection(db, 'Donations'), {
                ...donationData,
                status: 'approved',
            });
            await deleteDoc(doc(db, 'PendingDonations', donationId));
            Alert.alert("Donation approved!");
        } catch (error) {
            console.error("Error approving donation: ", error);
            Alert.alert("Error approving donation.");
        }
    };

    const handleReject = async (donationId: string) => {
        try {
            await deleteDoc(doc(db, 'PendingDonations', donationId));
            Alert.alert("Donation rejected.");
        } catch (error) {
            console.error("Error rejecting donation: ", error);
            Alert.alert("Error rejecting donation.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ෆාමසි දත්ත</Text>
            <View style={styles.pharmacyDetails}>
                <Text style={styles.pharmacyText}>නම: {pharmacyData.name}</Text>
                <View style={styles.hr} />
                <Text style={styles.pharmacyText}>දුරකතන අංකය: {pharmacyData.phone}</Text>
                <View style={styles.hr} />
                <Text style={styles.pharmacyText}>ලිපිනය: {pharmacyData.address}</Text>
                <View style={styles.hr} />
                <Text style={styles.pharmacyText}>බැංකුව: {pharmacyData.bankDetails.bank}</Text>
                <Text style={styles.pharmacyText}>ශාඛාව: {pharmacyData.bankDetails.branch}</Text>
                <Text style={styles.pharmacyText}>ගිණුම් අංකය: {pharmacyData.bankDetails.accountNumber}</Text>
                <Text style={styles.pharmacyText}>ගිණුම් හිමියාගේ නම: {pharmacyData.bankDetails.accountHolderName}</Text>
            </View>

            <Text style={styles.headerText}>Pending Donations</Text>
            {pendingDonation.length === 0 ? (
                <Text style={styles.noDonationsText}>No pending donations</Text>
            ) : (
                pendingDonation.map(donation => (
                    <View key={donation.id} style={styles.donationCard}>
                        <Text style={styles.donationText}>Name: {donation.name}</Text>
                        <Text style={styles.donationText}>Phone: {donation.phoneno}</Text>
                        <Text style={styles.donationText}>Donation: {donation.donation}</Text>
                        {donation.imageUrl && <Image source={{ uri: donation.imageUrl }} style={styles.image} />}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(donation.id, donation)}>
                                <Text style={styles.buttonText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(donation.id)}>
                                <Text style={styles.buttonText}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
            <Footer />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f2f2f2',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    pharmacyDetails: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    pharmacyText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    noDonationsText: {
        fontSize: 18,
        color: '#999',
        textAlign: 'center',
    },
    donationCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    donationText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginVertical: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    approveButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    hr: {
        borderBottomColor: '#ccc',  // Light grey color
        borderBottomWidth: 1,       // Set the line thickness
        marginVertical: 10,         // Space around the line
      },
    rejectButton: {
        backgroundColor: '#F44336',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Pharmacy;
