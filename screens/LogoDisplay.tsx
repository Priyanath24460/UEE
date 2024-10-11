import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/StackNavigator';

type LogoDisplayNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

const LogoDisplay = () => {
  const navigation = useNavigation<LogoDisplayNavigationProp>();

  useEffect(() => {
    // Automatically navigate to the login page after 5 seconds
    const timer = setTimeout(() => {
      navigateToLogin();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the timer if the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  // Function to navigate to the login page
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <TouchableWithoutFeedback onPress={navigateToLogin}>
      <View style={styles.container}>
        
        {/* Display the logo */}
        <Image
          source={require('../assets/images/logonew.png')} // Update the path to your logo
          style={styles.logo}
        />
        
        
       
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Light blue background
  },
  logo: {
    width: 400, // Adjust the size of the logo
    height: 400, // Adjust the size of the logo
    resizeMode: 'contain', // Ensures the logo maintains its aspect ratio
    marginBottom: -40, // Adds spacing below the logo
    marginLeft:20
  },
  
  
});

export default LogoDisplay;
