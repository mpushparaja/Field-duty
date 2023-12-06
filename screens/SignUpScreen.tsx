import React from 'react';
import { useAuth} from '../Auth';
import { View, SafeAreaView, TextInput, Button, Text} from 'react-native';
import {styles} from '../Styles';

export const SignUpScreen = ({navigation}: {navigation: any}) => {
  const auth = useAuth();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');

  const signIn = async () => {
    auth.signIn(firstName, lastName);
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.signUpContainer}>
        <View style={{alignItems:'flex-start'}}>
          <Text> Please enter your name</Text>
        </View>
        <View style={styles.input}>
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.input}>
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <Button title="Sign Up" onPress={signIn} />
      </View>
    </SafeAreaView>
  );
}
