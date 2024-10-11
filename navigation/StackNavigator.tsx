import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import FindHospitalScreen from '@/screens/hospitals/FindHospitalScreen';
import ReviewPage from '@/screens/hospitals/ReviewPage';
import Register from '@/screens/Register';
import Login from '@/screens/Login';
import FindAmbulanceScreen from '@/screens/Ambulance/FindAmbulanceScreen';
import MapScreen from '@/screens/Ambulance/MapScreen';
import Medicine from '@/screens/firstAid/Medicine';
import Burn from '@/screens/firstAid/Burn';
import AddEmergencySituationForm from '@/screens/firstAid/AddEmergencySituationForm';
import { NavigationContainer } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';

import LogoDisplay from '@/screens/LogoDisplay';

export type Hospital = {
  name: string;
  location?: string;
  // Add other fields as necessary
}
// Define the PharmacyData type
export type PharmacyData = {
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

import Pharmacy from '@/screens/donations/Pharmacy';
import Upload from '@/screens/donations/UploadSlip';
import DonationPool from '@/screens/donations/DonationPool';
import PharmacySignUp from '@/screens/donations/PharmacySignUp';
import StatusScreen from '@/screens/donations/StatusScreen';

export type RootStackParamList = {

  LogoDisplay:undefined
   Login:undefined;
   Register:undefined;
   Home:undefined;
   FindHospitalScreen:undefined;
   ReviewPage: { hospital: Hospital }; // Add this line



   //Ambulance
   FindAmbulanceScreen:undefined;
   MapScreen:undefined;

   //donations
   Pharmacy: { pharmacyData: PharmacyData };
   Upload: { id: string; name: string; amount:number };
   DonationPool: undefined;
   PharmacySignUp: undefined;
   Medicine:undefined;
   StatusScreen: { donationId?: string | null, status?: string | null };


   Burn:{ situationId: string };
   AddEmergencySituationForm: undefined;

  };
  const Stack = createStackNavigator<RootStackParamList>();



const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="LogoDisplay"
    
    screenOptions={{
    
      headerStyle: styles.header,  // Apply header styles
      headerTintColor: '#fff',     // Text color
      headerTitleStyle: styles.headerTitle,  // Title styles       
    }}
    >
        <Stack.Screen 
        name="LogoDisplay" 
        component={LogoDisplay} 
        options={{ title: '' }} 
      />


        <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ title: '' }} 
      />
      <Stack.Screen 
        name="Register" 
        component={Register} 
        options={{ title: '' }} 
      />



       <Stack.Screen 
        name="FindHospitalScreen" 
        component={FindHospitalScreen} 
        options={{ title: 'රෝහල්' }} 
      /> 
       
      
      <Stack.Screen 
        name="Home" 
        component={Home} 
        options={{ title: 'Home' }} 
      />
      <Stack.Screen
        name="ReviewPage"
        component={ReviewPage}
        options={{ title: 'Add Review' }} // Title for the review page
      />

     <Stack.Screen
       name='Pharmacy'
       component={Pharmacy}
        options={{ title: 'Pharmacy' }}
       />
      <Stack.Screen
       name='Upload'
        component={Upload}
        options={{ title: 'යොමු කිරීම්' }}
       />
      <Stack.Screen
        name='DonationPool'
        component={DonationPool}
        options={{ title: 'මූල්‍ය ප්‍රදාන' }} 
      />
      <Stack.Screen
        name='PharmacySignUp'
        component={PharmacySignUp}
        options={{ title: 'PharmacySignUp' }}
      />

      <Stack.Screen
      name='StatusScreen'
      component={StatusScreen}
      options={{ title: 'පරිත්‍යාග' }} 
      />

      
      <Stack.Screen 
        name="FindAmbulanceScreen" 
        component={FindAmbulanceScreen} 
        options={{ title: 'ගිලන්රථ පිටුව' }} 
      />
       <Stack.Screen 
        name="MapScreen" 
        component={MapScreen} 
        options={{ title: 'MapScreen' }} 
      />

      
      <Stack.Screen 
        name="Medicine" 
        component={Medicine} 
        options={{ title: 'ප්‍රථමාධාර' }} 
      />
      <Stack.Screen 
        name="Burn" 
        component={Burn} 
        options={{ title: 'පියවර' }} 
      />
      
      <Stack.Screen 
        name="AddEmergencySituationForm" 
        component={AddEmergencySituationForm} 
        options={{ title: 'AddEmergencySituationForm' }} 
      />
      
      

    </Stack.Navigator>
    
  )
}

export default StackNavigator

const styles = StyleSheet.create({header: {
    backgroundColor: '#108292', // Background color for the header
    height:60
    
  },
  headerTitle: {
    fontWeight: 'bold',
    
  },})