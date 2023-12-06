import { StyleSheet} from 'react-native';

//create our styling code:
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'center',
  },
  wrapper: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    padding: 20,
    flexDirection:"row",
    justifyContent:'space-between'
  },
  signUpContainer: {
    flex: 1,
    margin: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderColor: "gray",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    margin: 5,
  },
  infoText: {
    marginBottom: 10,
  },
  toolbarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  toolbarText: {
    padding: 10,
  },
  mapContainer: {
    flex: 9,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});