import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// import {navigationRef} from './RootNavigation';
import {AuthProvider, useAuth} from './Auth';
import SplashScreen from './screens/SplashScreen';
import {AuthStack, AppStack} from './Stacks';



export const Router = () => {
  const {authData, loading} = useAuth();

  if (loading) {
    return <SplashScreen />;
  }
  return (
    <NavigationContainer /* ref={navigationRef} */>
      {authData?.token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const App = () => {

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App;


