import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/StackNavigator'; // Ensure correct path
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

// Define navigation prop type
type NavigationProp = StackNavigationProp<RootStackParamList>;

const Footer: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={() => navigation.navigate('MapScreen')} style={styles.iconButton}>
      <FontAwesome5 name="ambulance" size={24} color="#ffffff" />
        <Text style={{ color: '#ffffff' }}>ගිලන්රථ</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('FindHospitalScreen')} style={styles.iconButton}>
      <FontAwesome5 name="hospital" size={24} color="#ffffff" />
        <Text style={{ color: '#ffffff' }}>රෝහල්</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Medicine')} style={styles.iconButton}>
      <FontAwesome5 name="first-aid" size={24} color="#ffffff" />
        <Text style={{ color: '#ffffff' }}>ප්‍රථමාධාර</Text>
      </TouchableOpacity>

      

      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
      <FontAwesome5 name="donate" size={24} color="#ffffff" />
        <Text style={{ color: '#ffffff' }}>පරිත්‍යාගය</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.iconButton}>
      <FontAwesome5 name="user-alt" size={24} color="#ffffff" />
        <Text style={{ color: '#ffffff' }}>ගිණුම</Text>
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
    backgroundColor:'#108292', // Equivalent to bg-gray-300
  },
  iconButton: {
    alignItems: 'center',
  },
});

export default Footer;
