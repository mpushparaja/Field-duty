import React from 'react';
import { AppState, View, SafeAreaView, Alert, Text, TextInput, Switch } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import dayjs from 'dayjs';

import { useAuth } from '../Auth';
import { _addActivity, _addDuty, _findEmployee } from "../Data";
import { IMarker, IEmployee, IDuty, ILocation } from '../Interfaces';
import { showLocation } from '../MapUtils';
import { MIN_INTERVAL_IN_MIN, MAX_INTERVAL_IN_MIN, FACEID_ACK_TIME_IN_MIN, FACEID_NOTIFY_TIME_IN_MIN, defaultLocation } from '../Settings'
import { styles } from '../Styles';
import { requestLocationPermission, shouldRequestFaceID, logMessage} from '../Utils';
import Notifications from '../Notification';

export let mapRef: MapView | null;

/*
  The home screen
*/
export default function HomeScreen() {

  const auth = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [employee, setEmployee] = React.useState<IEmployee>();
  const [location, setLocation] = React.useState<ILocation>();
  const [lastSave, setLastSave] = React.useState<void | Date>();
  const [markers, setMarkers] = React.useState<IMarker[]>([]);
  const [pendingFaceId, setPendingFaceId] = React.useState(false);
  const [duty, setDuty] = React.useState<IDuty>();
  // const [onDuty, setOnDuty] = React.useState(false);

  const onDuty = () => duty ? true : false;

  /*
    Add marker to the list of markers, this will get reflected on the map.
  */
  const addMarker = (date: void | Date, color: string, latitude: number  | undefined, longitude: number  | undefined ) => {
    if (date && latitude && longitude) {
      setMarkers([...markers, { key: date.getMilliseconds(), title: dayjs(date).format('h:mm:ss A'), color: color, coordinates: { latitude: latitude, longitude: longitude } }])
    }
    return date;
  };

  const createAppStateListener = (employeeId: string | undefined, dutyId: string | undefined) => {
    logMessage(employeeId, dutyId, "Creating App State Listener ");
    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'background' /* nextAppState.match(/active|inactive|background/) */) {
          logMessage(employeeId, dutyId, "App is going into background");
          logMessage(employee?.id, duty?.id, "Scheduled notification in " + MAX_INTERVAL_IN_MIN + " minutes");
          Notifications.scheduleNotification({ reminder: "Face ID", delay: MAX_INTERVAL_IN_MIN * 60 });
        } else if (nextAppState === 'active') {
          logMessage(employeeId, dutyId, "App is now active");
          logMessage(employee?.id, duty?.id, "Cancelling scheduled notifications");
          Notifications.cancelNotification(); 
          fetchLocation();
        }
      },
    );
    return () => {
      logMessage(employeeId, dutyId, "Removing App State Listener ");
      appStateListener?.remove();
    };
  }

  /* 
    This is invoked when the the 'On Duty' vs 'Off Duty' slider is selected. When a new duty starts the then the duty ID needs to be generated via the webservices. 
    This duty id is saved in the app session which will cause the current location to be fetched. When current location is fetched, which will automatically trigger 
    a check call to the webservices with the location. 
  */
  const toggleDutySwitch = () => {
    if (!duty) {
      _addDuty().then((duty) => {
        logMessage(employee?.id, duty?.id, "Starting duty");
        setDuty(duty);
      })
    }
    else {
      logMessage(employee?.id, duty?.id, "Ending duty");
      setDuty(undefined);
    }
    // setOnDuty(previousState => !previousState);
  };

  const startBackgroundTimer = () => {
    logMessage(employee?.id, duty?.id, "Starting background timer with interval of " + MIN_INTERVAL_IN_MIN + " mins");
    BackgroundTimer.runBackgroundTimer(() => {
      logMessage(employee?.id, duty?.id, "Background timer triggering location fetch");
      fetchLocation();
    }, MIN_INTERVAL_IN_MIN * 60 * 1000);
  }

  const stopBackgroundTimer = () => {
    logMessage(employee?.id, duty?.id, "Stopping background timer");
    BackgroundTimer.stopBackgroundTimer();
  }

  /*
    Gets the curreent location
  */
  const fetchLocation = () => {
    requestLocationPermission();
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        logMessage(employee?.id, duty?.id, "Got new location (" + latitude + "," + longitude + ")");
      },
      error => {
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      },
    );
  };

  /*
    Save locaiton as checkout
  */
  const saveLocationAsCheckout = () => {
    logMessage(employee?.id, duty?.id, "Check out at location (" + location?.latitude + "," + location?.longitude + ")");
    _addActivity("CHECKOUT", location?.latitude, location?.longitude, duty, employee, false, false).then((date) => {
      addMarker(date, "blue", location?.latitude, location?.longitude);
      setLastSave(date);
    })
  };

  /*
    Save locaiton without FaceID
  */
  const saveLocationWithoutFaceId = () => {
    logMessage(employee?.id, duty?.id, "Check in at location (" + location?.latitude + "," + location?.longitude + ")");
    _addActivity("CHECKIN", location?.latitude, location?.longitude, duty, employee, false, false).then((date) => {
      addMarker(date, "blue", location?.latitude, location?.longitude);
      setLastSave(date);
    })
  };

  /*
    Save location with FaceID
  */
  const saveLocationWithFaceId = () => {
    logMessage(employee?.id, duty?.id, "Check in location (" + location?.latitude + "," + location?.longitude + ") with FaceID");
    const challenge = new Date();
    setPendingFaceId(true);
    Alert.alert(
      'FaceID',
      'Please provide FaceID',
      [
        {
          text: 'Okay',
          onPress: () => {
            var milliSecondsDiff = new Date().getTime() - challenge.getTime();
            logMessage(employee?.id, duty?.id, "FaceID acknowledged in " + milliSecondsDiff + " milliseconds.");
            if (milliSecondsDiff < (FACEID_ACK_TIME_IN_MIN * 60 * 1000)) {
              _addActivity("CHECKIN", location?.latitude, location?.longitude, duty, employee, true, true).then((date) => {
                addMarker(date, "green", location?.latitude, location?.longitude);
                setLastSave(date);
              })

            }
            else {
              _addActivity("CHECKIN", location?.latitude, location?.longitude, duty, employee, true, false).then((date) => {
                addMarker(date, "red", location?.latitude, location?.longitude);
                setLastSave(date);
              })
            }
            setPendingFaceId(false);
            Alert.alert('FaceID Saved');
          },
          style: 'cancel',
        },
      ],
      {
        cancelable: false,
        // onDismiss: () => {
        //   Alert.alert(
        //     'FaceID was dismissed by tapping outside of the alert dialog.',
        //   ),
        //   setPendingFaceId(false);
        // }
      },
    );
  };

  const shouldSaveLocation = () => {
    if (!lastSave) {
      return true;
    }
    else {
      var milliSecondsDiff = new Date().getTime() - lastSave.getTime();
      logMessage(employee?.id, duty?.id, (milliSecondsDiff / (60 * 1000)) + " minutes since last location saved");
      if (milliSecondsDiff > (MIN_INTERVAL_IN_MIN * 60 * 1000)) {
        return true;
      }
    }
    return false;
  }

  const saveLocation = () => {
    if (duty) {
      if (shouldSaveLocation()) {
        if (!pendingFaceId && shouldRequestFaceID()) {
          saveLocationWithFaceId();
        }
        else {
          saveLocationWithoutFaceId();
        }
      }
    }
    else {
      saveLocationAsCheckout();
    }
  }

  /*
    Load the employee information at load time
  */
  React.useEffect(() => {
    if (loading) {
      logMessage(employee?.id, duty?.id, "Initializing ..");
      createAppStateListener(employee?.id, duty?.id);
      _findEmployee(auth.authData?.token).then((employee) => {
        setEmployee(employee);
      })
      .finally(() => setLoading(false));
    }
  }, [loading]);

  /*
    When duty changes get the location (which will trigger a check in for that location as well).
  */
  React.useEffect(() => {
    if (!loading) {
      fetchLocation();
      if (duty) {
        startBackgroundTimer();
      }
      else {
        stopBackgroundTimer();
      }
    }
  }, [duty]);

  /*
    When location changes then invoke a check in call to the backend with that location.
  */
  React.useEffect(() => {
    if (location) {
      showLocation(mapRef, location?.latitude, location?.longitude);
      saveLocation();
    }
  }, [location]);

  /*
   When a FaceID is pending it can happen under a few scenarios
   1. The app is in the background or going into background, which means a notification needs to be scheduled to remind the user
   2. The app is in the foregound, which means nothing needs to be done and any scheduled notifications need to be cancelled.
 */
  React.useEffect(() => {
    if (location)
      if (pendingFaceId) {
        logMessage(employee?.id, duty?.id, "Face ID is pending with the app currently in " + AppState.currentState + " state");
        logMessage(employee?.id, duty?.id, "Scheduled notification in " + FACEID_NOTIFY_TIME_IN_MIN + " minutes");
        Notifications.scheduleNotification({ reminder: "Face ID", delay: FACEID_NOTIFY_TIME_IN_MIN * 60 });
      }
      else {
        logMessage(employee?.id, duty?.id, "Cancelling scheduled notifications");
        Notifications.cancelNotification(); 
      }
  }, [pendingFaceId]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.wrapper}>
        <View style={styles.infoContainer}>
          <View>
            <Text style={styles.infoText}>Employee</Text>
            <TextInput editable={false}>{employee?.firstName + " " + employee?.lastName}</TextInput>
          </View>
          <View>
            {onDuty() ?
              <Text style={styles.infoText}>Duty Started</Text>
              :
              <Text style={styles.infoText}>Last Duty</Text>
            }
            <TextInput editable={false}>{dayjs(duty?.createDate).format('MMM D, YYYY h:mm A')}</TextInput>
          </View>

        </View>
        <View style={styles.mapContainer}>
          <MapView
            ref={(c) => mapRef = c}
            style={styles.map}
            initialRegion={{
              latitude: defaultLocation?.latitude,
              longitude: defaultLocation?.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            // showsUserLocation={true}
            // showsMyLocationButton={false} 
          >
            {markers.map(marker => (
              <Marker
                key={marker.key}
                coordinate={marker.coordinates}
                title={marker.title}
                pinColor={marker.color}
              />
            ))}
          </MapView>
        </View>
        <View style={styles.toolbarContainer}>
          <Text style={styles.toolbarText}>Off Duty</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={onDuty() ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleDutySwitch}
            value={onDuty()}
          />
          <Text style={styles.toolbarText}>On Duty</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};