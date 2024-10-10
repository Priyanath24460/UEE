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

export type Hospital = {
  name: string;
  location?: string;
  // Add other fields as necessary
}

import Pharmacy from '@/screens/donations/Pharmacy';
import Upload from '@/screens/donations/UploadSlip';
import DonationPool from '@/screens/donations/DonationPool';
import PharmacySignUp from '@/screens/donations/PharmacySignUp';


export type RootStackParamList = {

   Login:undefined;
   Register:undefined;
   Home:undefined;
   FindHospitalScreen:undefined;
   ReviewPage: { hospital: Hospital }; // Add this line



   //Ambulance
   FindAmbulanceScreen:undefined;
   MapScreen:undefined;
   Pharmacy: undefined;
   Upload: { id: string; name: string };
   DonationPool: undefined;
   PharmacySignUp: undefined;
  };
  const Stack = createStackNavigator<RootStackParamList>();



const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login"
    
    screenOptions={{
    
      headerStyle: styles.header,  // Apply header styles
      headerTintColor: '#fff',     // Text color
      headerTitleStyle: styles.headerTitle,  // Title styles
    }}
    >
        <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ title: 'Login' }} 
      />
      <Stack.Screen 
        name="Register" 
        component={Register} 
        options={{ title: 'Register' }} 
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
        options={{title: 'Pharmacy'}}
      />

      <Stack.Screen
        name='Upload'
        component={Upload}
        options={{title: 'Upload'}}
      />

      <Stack.Screen
        name='DonationPool'
        component={DonationPool}
        options={{title: 'DonationPool'}} 
      />

      <Stack.Screen
      name='PharmacySignUp'
      component={PharmacySignUp}
      options={{title: 'PharmacySignUp'}}
      />
      
      <Stack.Screen 
        name="FindAmbulanceScreen" 
        component={FindAmbulanceScreen} 
        options={{ title: 'FindAmbulanceScreen' }} 
      />
       <Stack.Screen 
        name="MapScreen" 
        component={MapScreen} 
        options={{ title: 'MapScreen' }} 
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