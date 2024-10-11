import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { getAuth } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '@/layouts/Footer';
interface Donation {
    id: string;
    name: string;
    donation: string; // Change this to the appropriate type (e.g., number)
    status: 'pending' | 'approved';
    pharmacyId: string; // Add pharmacyId to the Donation interface
    userId: string;
}

interface Pharmacy {
    id: string;
    name: string;
}

const StatusScreen = () => {
    const [pendingDonations, setPendingDonations] = useState<Donation[]>([]);
    const [approvedDonations, setApprovedDonations] = useState<Donation[]>([]);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;

// Fetch Pending Donations
useEffect(() => {
    if (currentUserId) {
        const pendingQuery = query(
            collection(db, 'PendingDonations'),
            where('userId', '==', currentUserId),
            where('status', '==', 'pending')
        );

        const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
            const pendingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
            setPendingDonations(pendingData);
            setLoading(false);
        });
        return () => unsubscribePending();
    }
}, [currentUserId]);

// Fetch Approved Donations
useEffect(() => {
    if (currentUserId) {
        const approvedQuery = query(
            collection(db, 'Donations'),
            where('userId', '==', currentUserId),
            where('status', '==', 'approved')
        );

        const unsubscribeApproved = onSnapshot(approvedQuery, (snapshot) => {
            const approvedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
            setApprovedDonations(approvedData);
            setLoading(false);
        });
        return () => unsubscribeApproved();
    }
}, [currentUserId]);

    // Fetch Pharmacies
    useEffect(() => {
        const unsubscribePharmacies = onSnapshot(collection(db, 'pharmacies'), (snapshot) => {
            const pharmaciesData = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Pharmacy));
            setPharmacies(pharmaciesData);
        });
        return () => unsubscribePharmacies();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#007791" style={{alignItems:'center', marginTop:250}}/>;
    }
    const cardColors = ['#ffb6c1','#76ABDF','#E0F7FA', '#FFCDD2', '#C8E6C9', '#FFF9C4', '#f0e68c',   '#d3ffce', '#d3ffce']; // Colors array
    return (
        <LinearGradient colors={['#e0f7fa', '#b2ebf2']} style={styles.container}>
        {/* Pending Donations Section */}
        <View style={styles.pendingContainer}>
        <Text style={styles.header}>පොරොත්තු ප්‍රදාන ⏳🔜⌛</Text>
        {pendingDonations.length > 0 ? (
            <FlatList
                data={pendingDonations}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={[styles.donationCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardText}>{item.name}</Text>
                            <Text style={{fontWeight:'bold', }}>Status: {item.status}</Text>
                            <TouchableOpacity style={styles.checkIcon}>
                                <Icon name="exclamation-circle" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        ) : (
            <Text>No pending donations</Text>
        )}</View>
            {/* Approved Donations Section */}
            <View style={styles.approvedContainer}>
        <Text style={styles.header}>අනුමත ප්‍රදාන ⌛</Text>
        {approvedDonations.length > 0 ? (
            
            <FlatList
                data={approvedDonations}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                    const pharmacy = pharmacies.find(ph => ph.id === item.pharmacyId);
                    return (
                        <View style={[styles.donationCard, { backgroundColor: cardColors[index % cardColors.length] }]}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardText}>රු. {item.donation}</Text>
                                <Text style={{fontWeight:'bold', fontSize:18,marginBottom: 10,}}>{pharmacy ? pharmacy.name : 'Unknown'}</Text>
                                <Text style={{fontWeight:'bold', }}>Status: {item.status}</Text>
                                <TouchableOpacity style={styles.checkIcon}>
                                    <Icon name="check-circle" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
            
        ) : (
            <Text>No approved donations</Text>
        )}<Footer />
        </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    cardContent: {
        flexDirection: 'column',
    },
    pendingContainer: {
        backgroundColor: '#8DA399', // Make background semi-transparent
        padding: 15,
        borderRadius: 8,
        elevation: 3,
    },
    approvedContainer: {
        backgroundColor: '#008080',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        elevation: 3,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
        color: '#ffff',
    },
    donationCard: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
        borderRadius: 8,
        position: 'relative', // important for absolute positioning of checkIcon
        elevation: 2,
    },
    cardText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    cardStatus: {
        fontSize: 14,
        color: '#555',
    },
    donationItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
        borderRadius: 8,
    },
    approveButton: {
        backgroundColor: '#4caf50',
        borderRadius: 50,
        padding: 5,
        marginLeft:0,
        position: 'absolute',
        right: 10,
        top: 10,
    },
    iconWrapper: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    checkIcon: {
        position: 'absolute',
        top: 10,
        right: 10, // Positioning the check icon on the top-right corner
        backgroundColor: '#4CAF50', // Circle background color
        borderRadius: 20,
        padding: 5, // Adds some padding to make the circle around the icon
    },
});

export default StatusScreen;
