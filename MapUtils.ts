
import MapView from 'react-native-maps';
import { MAP_ANIM_DELAY_IN_SEC } from './Settings';

/*
Moves the map to show the ccurrent location.
*/
export const showLocation = (mapRef: MapView | null, latitude: number | undefined,longitude: number | undefined) => {
    if (latitude && longitude) {
        //Animate the user to new region. Complete this animation in 3 seconds
        mapRef?.animateToRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
        }, MAP_ANIM_DELAY_IN_SEC * 1000);
    }
};