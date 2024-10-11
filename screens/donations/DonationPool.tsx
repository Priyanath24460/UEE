import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import * as Progress from 'react-native-progress'; // Import progress bar
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '@/layouts/Footer';

type Pharmacy = {
    id: string;
    name: string;
    address?: string;
    amount: number;
};

type DonationPoolNavigationProp = NavigationProp<RootStackParamList, 'DonationPool'>;

const DonationPool = () => {
    const navigation = useNavigation<DonationPoolNavigationProp>();
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true); // Loading state

    // Assume a maximum donation goal (you can adjust this based on your needs or make it dynamic)
    const MAX_DONATION_GOAL = 5000;

    const fetchPharmacies = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'pharmacyPool'));
            const pharmaciesData = await Promise.all(querySnapshot.docs.map(async doc => {
                const data = doc.data() as { name: string; address: string };
                const pharmacyId = doc.id;

                const donationsSnapshot = await getDocs(collection(db, 'Donations'));
                let totalAmount = 0;

                donationsSnapshot.docs.forEach(donationDoc => {
                    const donationData = donationDoc.data() as { pharmacyId: string; donation: number };
                    if (donationData.pharmacyId === pharmacyId) {
                        totalAmount += parseFloat(donationData.donation.toString());
                    }
                });

                return { id: pharmacyId, name: data.name, address: data.address, amount: totalAmount };
            }));

            setPharmacies(pharmaciesData);
        } catch (error) {
            console.error("Error fetching pharmacies: ", error);
        } finally {
            setLoading(false); // Set loading to false once fetching is done
        }
    };

    useEffect(() => {
        fetchPharmacies();
    }, []);

    const handlePharmacyPress = (pharmacyId: string, pharmacyName: string, amount: number) => {
        navigation.navigate('Upload', { id: pharmacyId, name: pharmacyName, amount });
    };
    
    const colors = ['#76ABDF', '#f0e68c',  '#ffb6c1', '#d3ffce', '#d3ffce'];
    
    return (
        <View style={styles.container}>
            <Text style={styles.header}>ඖෂධ මිලදී ගැනීම ස‍දහා මූල්‍ය ප්‍රධාන සිදුකිරීමට
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('StatusScreen', { donationId: null, status: null })}>
                <Text style={{ fontWeight: 'bold', fontSize: 18,textAlign: 'right', padding:10,color: '#082567'}}>පරිත්‍යාග දත්ත  
                    <Icon name="arrow-circle-right" size={24} color="#4CAF50" style={styles.checkIcon} />
                </Text>
            </TouchableOpacity>
            {loading ? ( // Check if loading
                <ActivityIndicator size="large" color="#0018A8" style={styles.loadingIndicator} />
            ) : (
                <FlatList
                    style={styles.container1}
                    data={pharmacies}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => handlePharmacyPress(item.id, item.name, item.amount)}>
                            <View style={[styles.pharmacyItem, { backgroundColor: colors[index % colors.length] }]}>
                                <Text style={styles.pharmacyName}>{item.name}</Text>
                                <Text style={styles.pharmacyAddress}>{item.address || 'Address not available'}</Text>
                                <Text style={styles.amountText}>ශේෂය : රු.{item.amount}.00</Text> 
                                <Text style={styles.maxAmountText}>රු.{MAX_DONATION_GOAL}</Text>
                                
                                {/* Progress Bar */}
                                <Progress.Bar
                                    progress={item.amount / MAX_DONATION_GOAL}
                                    width={null}
                                    color="#4caf50"
                                    unfilledColor="#e0e0e0"
                                    borderWidth={0}
                                    borderRadius={10}
                                    height={18}
                                    animated={true}
                                    animationType="spring"
                                    animationConfig={{
                                        bounciness: 10,
                                        speed: 12,
                                    }}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}<Footer />
             </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20, 
        height: '100%',
        backgroundColor: '#eof7fa'
    },
    container1: {
        paddingTop: 10,
        paddingBottom: 30,
    },
    header: {
        alignItems: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    pharmacyItem: {
        padding: 20,
        paddingBottom: 30,
        backgroundColor: '#f9f9f9',
        marginBottom: 30,
        borderRadius: 20,
        shadowOpacity: 0.4,
    },
    pharmacyName: {
        textAlign: 'center',
        paddingBottom: 10,
        fontSize: 19,
        fontWeight: 'bold',
    },
    pharmacyAddress: {
        paddingBottom: 6,
        fontSize: 20,
        color: '#555',
        fontWeight:'bold',
        textAlign: 'center',
    },
    amountText: {
        paddingBottom: 10,
        fontSize: 16,
        color: '#000',
        marginTop: 5,
        fontWeight: 'bold'
    },
    maxAmountText: {
        position: 'absolute', // Position the text absolutely
        right: 20, // Align it to the right corner
        top: 80, // Move it above the progress bar
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4caf50',
    },
    loadingIndicator: {
        marginTop: 250,
        alignItems:'center'
    },
    checkIcon: {
        position: 'absolute',
        top: 10,
        right: 10, // Positioning the check icon on the top-right corner
        borderRadius: 20,
        padding: 20, // Adds some padding to make the circle around the icon
    },
});

export default DonationPool;
