// DonationPool.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Ensure this path is correct

type DonationPoolNavigationProp = NavigationProp<RootStackParamList, 'DonationPool'>;

const DonationPool = () => {
    const navigation = useNavigation<DonationPoolNavigationProp>(); // Define navigation prop
    const [pharmacies, setPharmacies] = useState<{ id: string; name: string; address: string }[]>([]); // Specify pharmacy type

    // Fetch pharmacy data from Firestore
    const fetchPharmacies = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'Pharmacy'));
            const pharmaciesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as { id: string; name: string; address: string }[];
            setPharmacies(pharmaciesData);
        } catch (error) {
            console.error("Error fetching pharmacies: ", error);
        }
    };

    useEffect(() => {
        fetchPharmacies();
    }, []);

    // Navigate to the pharmacy detail page
    const handlePharmacyPress = (pharmacyId: string, pharmacyName: string) => {
        navigation.navigate('Upload', { id: pharmacyId, name: pharmacyName });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Donation Pool</Text>
            <FlatList
                data={pharmacies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePharmacyPress(item.id, item.name)}>
                        <View style={styles.pharmacyItem}>
                            <Text style={styles.pharmacyName}>{item.name}</Text>
                            <Text style={styles.pharmacyAddress}>{item.address}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
             <TouchableOpacity onPress={()=>navigation.navigate('Pharmacy')}>
        <Text >pharmacy register</Text>
      </TouchableOpacity>
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
});

export default DonationPool;
