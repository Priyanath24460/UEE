import Ionicons from '@expo/vector-icons/Ionicons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator'; // Ensure correct path

// Define navigation prop type
type NavigationProp = StackNavigationProp<RootStackParamList>;

const Footer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
        <Ionicons name="home-outline" size={24} color="#1b2785" />
        <Text style={{ color: '#1b2785' }}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
      <Ionicons name="search" size={24} color="#1b2785" />

        <Text style={{ color: '#1b2785' }}>Help</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
      <Ionicons name="qr-code" size={24} color="#1b2785" />

        <Text style={{ color: '#1b2785' }}>QR Code</Text>
      </TouchableOpacity>

      

      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
        <Ionicons name="person-circle-outline" size={24} color="#1b2785" />
        <Text style={{ color: '#1b2785' }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    width: '110%',
    height: 60, // Ensure it has a fixed height
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D1D5DB', // Equivalent to bg-gray-300
  },
  iconButton: {
    alignItems: 'center',
  },
});

export default Footer;
