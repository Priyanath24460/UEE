// DonationPool.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Ensure this path is correct

// Update the Pharmacy type to make address optional
type Pharmacy = {
    id: string;
    name: string;
    address?: string; // Make address optional
    amount: number; 
};

type DonationPoolNavigationProp = NavigationProp<RootStackParamList, 'DonationPool'>;

const DonationPool = () => {
    const navigation = useNavigation<DonationPoolNavigationProp>(); 
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]); 

    // Fetch pharmacy data from Firestore
    const fetchPharmacies = async () => {
        try {
            // Fetch all pharmacies from the pharmacyPool collection
            const querySnapshot = await getDocs(collection(db, 'pharmacyPool')); 
    
            // Initialize an array to hold the pharmacies with their total donations
            const pharmaciesData = await Promise.all(querySnapshot.docs.map(async doc => {
                const data = doc.data() as { name: string; address?: string }; 
                const pharmacyId = doc.id;
    
                // Fetch donations associated with this pharmacy
                const donationsSnapshot = await getDocs(collection(db, 'Donations'));
                let totalAmount = 0;
    
                // Calculate total donations for the pharmacy
                donationsSnapshot.docs.forEach(donationDoc => {
                    const donationData = donationDoc.data() as { pharmacyId: string; donation: number };
    
                    // Check if the pharmacyId matches and add to totalAmount
                    if (donationData.pharmacyId === pharmacyId) {
                        totalAmount += donationData.donation; // Add the donation amount
                    }
                });
    
                // Return pharmacy data along with the total donation amount
                return { id: pharmacyId, name: data.name, address: data.address, amount: totalAmount }; 
            }));
    
            // Update state with fetched pharmacies data
            setPharmacies(pharmaciesData);
        } catch (error) {
            console.error("Error fetching pharmacies: ", error);
        }
    };
    

    useEffect(() => {
        fetchPharmacies();
    }, []);

    // Navigate to the pharmacy detail page
    const handlePharmacyPress = (pharmacyId: string, pharmacyName: string, amount: number) => {
        navigation.navigate('Upload', { id: pharmacyId, name: pharmacyName, amount }); 
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Donation Pool</Text>
            <FlatList
                data={pharmacies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePharmacyPress(item.id, item.name, item.amount)}>
                        <View style={styles.pharmacyItem}>
                            <Text style={styles.pharmacyName}>{item.name}</Text>
                            <Text style={styles.pharmacyAddress}>{item.address || 'Address not available'}</Text>
                            <Text style={styles.amountText}>Total Amount: ${item.amount}</Text> 
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    pharmacyItem: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
        borderRadius: 5,
    },
    pharmacyName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pharmacyAddress: {
        fontSize: 14,
        color: '#555',
    },
    amountText: {
        fontSize: 16,
        color: '#000',
        marginTop: 5,
    },
});

export default DonationPool;
