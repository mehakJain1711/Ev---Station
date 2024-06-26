import { StyleSheet, View, Text } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AppMapView from "./AppMapView";
import Header from "./Header";
import SearchBar from "./searchBar";
import { UserLocationContext } from "../../Context/UserLocationContext";
import GlobalApi from "../../Utils/GlobalApi";
import PlaceListView from "./PlaceListView";
import { selectMarkerContext } from "../../Context/SelectMarkerContext";
export default function HomeScreen() {
  const { location, setLocation } = useContext(UserLocationContext);
  const [placeList, setPlaceList] = useState([]);
  const [options, setOptions] = useState([]);
  const [tempPlaceList, setTempPlaceList] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState([]);

  // useEffect(() => {
  //   location && GetNearByPlace();
  // }, [location]);

  // useEffect(() => {}, [tempPlaceList]);

  // useEffect(() => {
  //   const newOptions = placeList.reduce((acc, item) => {
  //     const values = item?.evChargeOptions?.connectorAggregation ?? [];
  //     for (let i = 0; i < values.length; i++) {
  //       if (values[i] && !acc.includes(values[i].type)) {
  //         acc.push(values[i].type);
  //       }
  //     }
  //     return acc;
  //   }, []);
  //   if (newOptions) setOptions(newOptions);
  // }, [placeList]);
  useEffect(() => {
    location && GetNearByPlace();
  }, [location]);

  useEffect(() => {
    // Initialize tempPlaceList with placeList when component mounts
    setTempPlaceList(placeList);
  }, [placeList]); // Trigger when placeList changes

  useEffect(() => {
    // Extract options from placeList when placeList changes
    const newOptions = placeList.reduce((acc, item) => {
      const values = item?.evChargeOptions?.connectorAggregation ?? [];
      for (let i = 0; i < values.length; i++) {
        if (values[i] && !acc.includes(values[i].type)) {
          acc.push(values[i].type);
        }
      }
      return acc;
    }, []);
    if (newOptions) setOptions(newOptions);
  }, [placeList]); // Trigger when placeList changes

  const GetNearByPlace=()=>{
    const data={
      "includedTypes": ["electric_vehicle_charging_station"],
      "maxResultCount": 10,
      "locationRestriction": {
      "circle": {
      "center": {
          "latitude": location?.latitude,
          "longitude": location?.longitude
        },
        "radius": 5000.0
      }
    }
  }
    GlobalApi.NewNearByPlace(data).then(resp=>{
      // console.log(JSON.stringify(resp.data));
      setPlaceList(resp.data?.places);
    });
  };
  return (
    <selectMarkerContext.Provider value={{ selectedMarker, setSelectedMarker }}>
      <View>
        <View style={styles.headerContainer}>
          <Header
            placeList={tempPlaceList}
            options={options}
            onClearFilter={() => {
              setTempPlaceList(placeList);
            }}
            onFilter={({ selectedType, connectorCount }) => {
              setTempPlaceList(placeList);
              let tempList = placeList.filter((item) => {
                let ccount = item?.evChargeOptions?.connectorCount;
                return ccount >= connectorCount;
              });
              setTempPlaceList(
                tempList.filter((item) => {
                  let cTypes =
                    item?.evChargeOptions?.connectorAggregation?.map(
                      (i) => i.type
                    ) ?? [];
                  return cTypes.includes(selectedType);
                })
              );
            }}
          />
          {/* {SearchBar({lat:28.64,lon:77.21,searchText:"Evstation"})} */}
          <SearchBar
            searchedLocation={(location) =>
              setLocation({
                latitude: location.lat,
                longitude: location.lng,
              })
            }
          />
        </View>
        {tempPlaceList && <AppMapView placeList={tempPlaceList} />}
        <View style={styles.placeListContainer}>
          {tempPlaceList && <PlaceListView placeList={tempPlaceList} />}
        </View>
      </View>
    </selectMarkerContext.Provider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    zIndex: 10,
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  placeListContainer: {
    position: "absolute",
    bottom: 0,
    zIndex: 10,
    width: "100%",
  },
});

{
  /* <SearchBar searchedLocation={(location)=>
  setLocation({
    latitude:location.lat,
    longitude:location.lng
  })}/> */
}
