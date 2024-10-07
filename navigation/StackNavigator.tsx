import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import FindHospitalScreen from '@/screens/hospitals/FindHospitalScreen';


export type RootStackParamList = {
   Home:undefined;
   FindHospitalScreen:undefined
  };
  const Stack = createStackNavigator<RootStackParamList>();



const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home"
    
    screenOptions={{
    
      headerStyle: styles.header,  // Apply header styles
      headerTintColor: '#fff',     // Text color
      headerTitleStyle: styles.headerTitle,  // Title styles
    }}
    >
       <Stack.Screen 
        name="FindHospitalScreen" 
        component={FindHospitalScreen} 
        options={{ title: 'FindHospitalScreen' }} 
      /> 
      
      <Stack.Screen 
        name="Home" 
        component={Home} 
        options={{ title: 'Home' }} 
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