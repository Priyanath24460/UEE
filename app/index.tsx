import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from '../navigation/StackNavigator'

const Index = () => {
  return (
    <NavigationContainer independent={true}>
      <StackNavigator />
    </NavigationContainer>
  );
};

export default Index;
