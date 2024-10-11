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
          source={require('../assets/images/logo.png')} // Update the path to your logo
          style={styles.logo}
        />
        <Text style={styles.text}>සාදරයෙන් පිළිගනිමු</Text>
        
        {/* Top-left bubble */}
        <View style={[styles.bubble, styles.topLeftBubble]} />
        
        {/* Bottom-right bubble */}
        <View style={[styles.bubble, styles.bottomRightBubble]} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ADD8E6', // Light blue background
  },
  logo: {
    width: 150, // Adjust the size of the logo
    height: 150, // Adjust the size of the logo
    resizeMode: 'contain', // Ensures the logo maintains its aspect ratio
    marginBottom: 20, // Adds spacing below the logo
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333', // Text color
    textAlign: 'center',
  },
  bubble: {
    width: 150,
    height: 150,
    backgroundColor: '#fff', // White bubble color
    borderRadius: 100, // Makes the bubble circular
    position: 'absolute', // Enables positioning in specific corners
  },
  topLeftBubble: {
    top: -30, // Adjusts position outside the visible area slightly
    left: -30, // Adjusts position outside the visible area slightly
  },
  bottomRightBubble: {
    bottom: -30, // Adjusts position outside the visible area slightly
    right: -30, // Adjusts position outside the visible area slightly
  },
});

export default LogoDisplay;
