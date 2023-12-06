import Geolocation from '@react-native-community/geolocation';
import { AppState, Platform, PermissionsAndroid } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

import { FACEID_CHECK_PROBABILITY, MIN_INTERVAL_IN_MIN } from './Settings'

/*
  Request permisssion to access location. See https://www.npmjs.com/package/@react-native-community/geolocation
*/
export async function requestLocationPermission() {
    if (Platform.OS === 'ios') {
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false, // skipPermissionRequests: true
        authorizationLevel: 'always', //authorizationLevel: 'whenInUse'
        enableBackgroundLocationUpdates: true,
      });
      Geolocation.requestAuthorization()
      // IOS permission request does not offer a callback :/
      return null
    } 
    else if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true
        } else {
          return false
        }
      }
      catch {
        // do nothing for now. 
      }
    }
}

/*
  A background timer for a one time timout.
*/
const createBackgroundTimer = () => {
  const PromiseValue = new Promise((resolve, reject)=>{
    BackgroundTimer.runBackgroundTimer(() => { 
      resolve(true)
      }, MIN_INTERVAL_IN_MIN * 60 * 1000);
  })
  // clean up after first run
  PromiseValue.finally(() => {
    BackgroundTimer.stopBackgroundTimer();
   }) ;

};

/*
Generates a random number as token
*/
export const generateTokenNumber = () => {
  return Math.random();
};

/*
  Face ID is requested once in a few times. The number of times the FaceID is requested is controlled by a probability setting.
*/
export const shouldRequestFaceID = () => {
    const min = 1;
    const max = 100;
    const token = Math.floor(Math.random() * (max - min + 1)) + min; 
    if (token < FACEID_CHECK_PROBABILITY * 100) {
        return true;
    }
    else {
        return false;
    }
};

/*
  Wrapper around the logger to include the context of the message
*/
export const logMessage = (employeeId: string | undefined, dutyId: string | undefined, message: string) => {
  if (!employeeId) employeeId = "####################################";
  if (!dutyId) dutyId = "####################################";
  console.log("{Date: " + new Date() + ", Employee ID: " + employeeId + ", Duty ID: " +  dutyId + "} - " + message);
}
