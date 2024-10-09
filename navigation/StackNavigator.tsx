import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import FindHospitalScreen from '@/screens/hospitals/FindHospitalScreen';
import ReviewPage from '@/screens/hospitals/ReviewPage';
import Login from '@/screens/Login';
import Register from '@/screens/Register';



export type Hospital = {
  name: string;
  location?: string;
  // Add other fields as necessary
}


export type RootStackParamList = {
   Home:undefined;
   FindHospitalScreen:undefined;
   ReviewPage: { hospital: Hospital }; // Add this line
   Login:undefined;
   Register:undefined
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