import { View, Text, StyleSheet, Dimensions, PixelRatio, TouchableOpacity, TouchableWithoutFeedback, ImageBackground, Button, Alert, Linking, Keyboard, KeyboardAvoidingView, TextInput } from "react-native";
import { Entypo, AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Asset } from "expo-asset";
import { Session } from '@supabase/supabase-js';
import { ChevronLeft } from "./svg";
import { SignInScreen } from "./signin";
import { SignUpScreen } from "./signup";
import { LandingScreen } from "./landingpage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigationState } from "@react-navigation/native";
import { supabase } from '../../config/supabase';
import { getImagekitUrlFromPath } from "../../config/imagekit";
import ModalBox from "react-native-modalbox";
import MapView, { UrlTile, Marker, Circle, Region, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, createContext, useContext, useReducer, useCallback } from "react";
import BottomSheet, { BottomSheetView, BottomSheetTextInput, BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import LottieView from "lottie-react-native";
import Carousel from "react-native-reanimated-carousel";
import debounce from "lodash.debounce";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WIDTH = Dimensions.get("window").width
const HEIGHT = Dimensions.get("window").height
const ITEM_WIDTH = WIDTH * 0.82
const ITEM_HEIGHT = HEIGHT * 0.44

const names = {}
const facilities = {}
const animation = require("../../assets/loader.json")

const NW = { lat: 6.066167, lon: -0.269583 }
const SE = { lat: 6.059883, lon: -0.258769 }

const MainScreen = ({ navigation }) => {

    interface Coord {
        lat: string,
        lon: string
    }
    interface Place {
        id: number,
        names: Array<string>,
        facilities: Array<string>,
        officialName: string,
        placeID: string,
        coord: Coord
    }

    interface SearchItem {
        key: number,
        icon: string,
        content: string
    }

    type Background = "mapview" | "carousel";
    type Render = "original" | "search"

    // const Context = createContext(true)

    const ProfileContainerStack = createStackNavigator()
    const BlockContainerStack = createStackNavigator()

    const route = useNavigationState(state => state.routeNames)

     
    const insets = useRef(useSafeAreaInsets())
    const googleMapsAPIKey = Constants.manifest2.extra.expoClient.extra.googleMapsApiKey

    const campus = [
        { id: 1, names: ["foe", "fhas", "faculty of engineering", "engineering block"], facilities: ["classroom", "office", "washroom", "workshop", "lab"], officialName: "Faculty Of Engineering", placeID: "ChIJ-f_vcYFq3w8RB-jHZuqSA0Q", coord: {lat: "6.0645867", lon: "-0.2658555"}, images: 4, classroom: [], office: [], washroom: [], workshop: [], lab: [] },
        { id: 2, names: ["fbne", "faculty of built and natural environment"], facilities: ["library","classroom", "office", "washroom"], officialName: "Faculty of Built and Natural Environment", placeID: "ChIJjRNljXdr3w8RmfE2dCRNU5I", coord: {lat: "6.065277499999999", lon: "-0.2657916"}, images: 3, library: [], classroom: [], office: [], washroom: [] },
        { id: 3, names: ["ccb", "central classroom block"], facilities: ["washroom", "classroom", "office", "lab", "library"], officialName: "Central Classroom Block", placeID: "ChIJTRlU9IBq3w8RJBZ1hdU3eQQ", coord: {lat: "6.0650474", lon: "-0.2633137"}, images: 4, washroom: [], classroom: [], office: [], lab: [], library: [{ name: "E-Library", direction: "The left block when facing CCB, last floor" }] },
        { id: 4, names: ["as", "applied science", "fast"], facilities: ["office", "theater", "lab", "washroom", "classroom", "typingpool"], officialName: "Applied Science", placeID: "ChIJvffQqIFq3w8RS9zAMHcllvA", coord: {lat: "6.0655414", lon: "-0.2647885"}, images: 5, office: [{ name: "Dean of Student Affairs", direction: "FAST block top floor, near FAST Dean's office, office number AS 212" }, { name: "FAST Dean", direction: "FAST block top floor, near Dean of student affairs' office, office number AS 211" }, { name: "FAST Accountant", direction: "FAST block top floor, near FAST Dean's office, office number AS 202"}, { name: "HoD Applied Maths", direction: "FAST block grand floor, below Dean of Student affairs' office, office number AS 114" }, { name: "HoD Professional Studies", direction: "FAST block grand floor, below FAST Dean's office, office number AS 113" }], theater: [ {name: "Abba Bentil", direction: "Right at the main entrance of FAST, opposite the staff common room"} ], lab: [ { name: "FAST computer lab", direction: "FAST block top floor, near FAST Administrators office, office number AS 210" } ], washroom: [], classroom: [], typingpool: [] },
        { id: 5, names: ["getfund"], facilities: ["washroom", "tvroom", "hostelroom", "studyroom", "gamepool", "shop"], officialName: "GetFund", placeID: "ChIJYdqTyIZq3w8RQBZzxr_cN2s", coord: {lat: "6.0619622", lon: "-0.2653302"}, images: 4, washroom: [], tvroom: [], hostelroom: [], studyroom: [], gamepool: [], shop: [] },
        { id: 6, names: ["tennis"], facilities: [], officialName: "Tennis", placeID: "ChIJUzNi3vBr3w8R2ZBtUl0JYIo", coord: {lat: "6.0610236", lon: "-0.2641309"}, images: 3 },
        { id: 7, names: ["basket ball", "bball"], facilities: [], officialName: "Basket Ball", placeID: "ChIJb9Uaq4Fq3w8RWMMfJx3oHgI", coord: {lat: "6.065430500000001", lon: "-0.2645425"}, images: 2 },
        { id: 8, names: ["adb", "agriculture development bank"], facilities: [], officialName: "Agriculture Development Bank", placeID: "ChIJHUgeNzVA3w8RhtgdHTd9DX8", coord: {lat: "6.0648173", lon: "-0.2654369999999999"}, images: 3 },
        { id: 9, names: ["ad"], facilities: ["clinic", "washroom", "classroom", "library", "radio", "lab", "office"], officialName: "AD Block ( Old Administration Block )", placeID: "ChIJVdBtEIFq3w8RrqQRORv2e5M", coord: {lat: "6.0644443", lon: "-0.2649825"}, images: 3, clinic: [ {name: "School clinic", direction: "AD block, ground floor, to the far right, after the pharmacy"} ], washroom: [ {name: "Washroom1", direction: "Left side of AD block"} ], classroom: [ {name: "Classroom1", direction: "First floor"} ], library: [ {name: "Main Library", direction: "Last floor, to the right of the councelling office"} ], radio: [ {name: "KTU Radio", direction: "Last floor, to the far left, after the councelling office"} ], lab: [ {name: "Thin client", direction: "AD block, ground floor, to the far left, after the old IT directorate"} ], office: [ { name: "Councelling Office", direction: "Top floor, between kTU radio and the library" } ] },
        { id: 10, names: ["fbms", "faculty of business and management studies"], facilities: ["classroom", "washroom", "conference", "office", "theater", "lab", "workshop", "shop"], officialName: "Faculty of Business and Management Studies", placeID: "ChIJIejocABr3w8RzW3tHkyur0w", coord: {lat: "6.065087", lon: "-0.2639526"}, images: 4, classroom: [], washroom: [], conference: [], office: [], theater: [], lab: [], workshop: [], shop: [] },
        { id: 11, names: ["gcb", "ghana commercial bank atm"], facilities: [], officialName: "Ghana Commercial Bank ATM", placeID: "ChIJV7-LHshr3w8Re6XgDWGQ5F0", coord: {lat: "6.0650265", lon: "-0.2647094"}, images: 2 },
        { id: 12, names: ["sg", "societe generale atm"], facilities: [], officialName: "Societe Generale Ghana ATM", placeID: "ChIJ93o3o1xr3w8RsSTxJL6cHkw", coord: {lat: "6.0646713", lon: "-0.2649737"}, images: 2 },
        { id: 13, names: ["compssa", "computer science department"], facilities: ["office", "lab", "washroom"], officialName: "Computer Science Department", placeID: null, coord: { lat: "6.064771", lon: "-0.26439" }, images: 4, office: [ {name: "HoD Office", direction: "top floor, to the far left after climbing the stairs, after lab 3, office number CC 202"}, {name: "Industrial Liaison Office", direction: "Ground floor to the right, after the main entrance, office number CC 109"},  {name: "Student Loans Office", direction: "Grand floor to the right, after the Industrial Liaiason, Office number CC 108"} ], lab: [ {name: "Lab1", direction: "Top floor to the right, after the exams room, office number CC 206"}, {name: "Lab2", direction: "Top floor to the left,before lab3, office number CC 204"}], washroom: [{name: "Washroom1", direction: "top floor to the far right"}] },
    ]
    
    const [showAvatar, setShowAvatar] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDescriptionModal, setShowDescriptionModal] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [description, setDescription] = useState({ name: null, direction: null })
    const [snapPoints, setSnapPoints] = useState(
        ["12%"]
    )
    const [background, setBackground] = useState<Background>("mapview")
    const [render, setRender] = useState({which: "original", render: null})

    const [textInputValue, setTextInputValue] = useState(null)
    const [initialRegion, setInitialRegion] = useState(
        {latitude: 6.063400336337259, longitude: -0.26424994084753095, latitudeDelta: 0.005, longitudeDelta: 0.005}
    )
    const [data, setData] = useState(
        [
            { key: 1, title: "Office", content: <Entypo name= "laptop" size= {20} color= {"white"}/> },
            { key: 2, title: "Washroom", content: <Entypo name= "water" size= {20} color= {"white"}/> },
        ]
    )
    const [mapRegion, setMapRegion] = useState<Region>(
        {
            latitude: 6.063400336337259,
            longitude: -0.26424994084753095,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }
    );
    const [recentData, setRecentData] = useState(
        // Array.from(
        //     {length: 2},
        //     (iter, idx) => (
        //         {key: idx, content: "", icon: ""}
        //     )
        // )
        []
    )
    const [searchData, setSearchData] = useState(
        []
    )

    const [profileVisible, setProfileVisible] = useState(false)
    const [profileClicked, setProfileClicked] = useState(null)
    const [profileInfo, setProfileInfo] = useState({ avatar: "../../assets/avatar.png", name: null, email: null })
    const [tempProfile, setTempProfile] = useState({ name: null, email: null })
    const [polylineCoordinates, setPolylineCoordinates] = useState([])
    const [destinationPosition, setDestinationPosition] = useState( { id: null, name: null, lat: null, lon: null, placeID: null} )
    const [currentPosition, setCurrentPosition] = useState( {name: null, lat: null, lon: null} )
    const [trackerPosition, setTrackerPosition] = useState( {name: null, lat: null, lon: null} )
    const [closetPlaceID, setClosetPlaceID] = useState({ name: null, lat: null, lon: null, placeID: null })
    const [backgroundID, setBackgroundID] = useState(0)
    const [carouselImages, setCarouselImages] = useState(
        []
    )

    const mainRef = useRef<BottomSheet>(null)
    const profileRef = useRef<BottomSheet>(null)
    const recentNavigateRef = useRef(null)
    const mapRef = useRef<MapView>(null)

    const inputRef = useRef<typeof BottomSheetTextInput>(null)
    const animationRef = useRef<LottieView>(null)
    const debouncedDelay = useRef(1000)
    const profileScreenNav = useRef(null)

    const thunderForestURL = "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=d0051eac5a6b44fabc51ab2f9a669c6e"
    const openstreetURL = "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const profileData = [
        {key: 1, icon:<Entypo name= "grid" size= {30} color= {"#858585"}/>, content:  "Library", arrow: null},
        {key: 2, icon: <Entypo name= "info" size= {30} color= {"#858585"}/>, content: "Preference", arrow: null},
        {key: 3, icon: <Entypo name= "arrow-left" size= {30} color= {"#858585"}/>, content: "Logout", arrow: null}
    ]

    const minZoomLevel = 0.005
    const maxLatitude = 6.07
    const minLatitude = 6.05
    const maxLongitude = -0.26
    const minLongitude = -0.27

    const debouncedSearch = useMemo(
        () => debounce((text) => performSearch(text), debouncedDelay.current),
    [])

    const performSearch = ( text: string ) => {

        let lowerCase = text.toLowerCase().trim()
        // setRecentData([])
        // console.log(lowerCase)
        
        profileRef.current?.close()
        mainRef.current?.expand()

        if (text.length > 0) {

            interface IDKey {

                id: number,
                key: string
            }
            const namesKeys = Object.keys(names)
            const facilitiesKeys = Object.keys(facilities)

            const IDsKey: Set<IDKey> = new Set()
            const searches = new Set()

            const combineKeys = [...namesKeys, ...facilitiesKeys]
            combineKeys.forEach((key) => {

                if (key.startsWith(lowerCase)) {

                    const infrastructureID: number = names[key] || facilities[key]
                    if (infrastructureID) {
                        
                        if (Array.isArray(infrastructureID)) {
                            infrastructureID.forEach(id => {

                                    const look = campus.find((item) => item.id === id)[key]
                                IDsKey.add({ id: id, key: key })
                            });
                        } else {

                            IDsKey.add({ id: infrastructureID, key: null })
                        }
                    }
                } else {

                    campus.forEach((block) => {
                        block.facilities.forEach((facility) => {

                            const check = block[facility].find((obj) => obj.name.toLowerCase() === lowerCase)
                            if (check?.name) {
                                
                                IDsKey.add({ id: block.id, key: `${facility}, ${check.name.toLowerCase()}` })
                            }
                        })
                    })
                }
            })
            IDsKey.forEach((IDkey) => {

                const infrastructure = campus.find((item) => item.id == IDkey.id)
                searches.add(JSON.stringify({key: IDkey.id, content: `${infrastructure.officialName}${IDkey.key ? `, ${IDkey.key}` : ""}`, icon: ""}))
            })

            searches.forEach((data: string) => {
                setSearchData((prevData) => (
                    [...prevData, JSON.parse(data)]
                ))
            })

        }
    }

    const decodePolyline = ( text: string ) => {

        const coordinates = [];
        let index = 0, len = text.length;
        let lat = 0, lng = 0;
    
        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = text.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = ((result >> 1) ^ -(result & 1));
            lat += dlat;
    
            shift = 0;
            result = 0;
            do {
                b = text.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = ((result >> 1) ^ -(result & 1));
            lng += dlng;
    
            coordinates.push({ latitude: (lat / 1E5), longitude: (lng / 1E5) });
        }
        return coordinates;
    }

    const fetchDirections = async () => {
        
        if (currentPosition.name && destinationPosition.name) {

            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${currentPosition.lat},${currentPosition.lon}&destination=${destinationPosition.lat},${destinationPosition.lon}&key=${googleMapsAPIKey}`;
            try {
    
                const response = await fetch(url);
                const data = await response.json();

                if (data.routes.length > 0) {
    
                    const points = decodePolyline(data.routes[0].overview_polyline.points);
                    setPolylineCoordinates(points);
    
                }
            } catch (error) {
                console.error("Error fetching directions:", error);
            }
        }
    }

    const isCoordinateInBounds = ( point: { lat: number, lon: number } ) => {

        // const { lat, lon } = point

        // const isLatInBounds = lat <= NW.lat && lat >= SE.lat
        // const isLonInBounds = lon >= NW.lon && lon <= SE.lon
      
        // return (
        //     isLatInBounds && isLonInBounds
        // )
        return (
            true
        )
    }
    
    const handleProfilePress = () => {
        
        setTextInputValue("")
        if (render.which === "search") {

            Keyboard.dismiss()
            setRender({which: "original", render: originalContent})
            setShowAvatar(true)
        } else {

            if (profileVisible) {

                setProfileVisible(false)
                profileRef.current?.close()

            } else  {

                setProfileVisible(true)
                profileRef.current?.expand()
                mainRef.current?.snapToIndex(1)
            }
        }

    }

    const handleProfileClose = () => {

        setProfileVisible(false)
        profileRef.current?.close()
        mainRef.current?.expand()
    }

    const handleMainChange = ( index: number ) => {
        
        if (index == 0) {
            setProfileVisible(false)
            profileRef.current?.close()

        }
    }

    const handleTextInputPress = () => {

        setSearchData([])
        setShowAvatar(false)
        setRender({which: "search", render: searchContent})
    }

    const handleTextInputFinish = () => {

        //
    }

    const handleTextInputChange = ( text: string ) => {

        setTextInputValue(text)
        setProfileVisible(false)
        setSearchData([])
        debouncedSearch(text)
    }

    const handleLibraryItemClick = ( title: string ) => {

        setTextInputValue(title)
        handleTextInputPress()
        debouncedSearch(title)

    }

    const handleToggleClick = ( toggled ) => {
        toggled !== backgroundID && (
            toggled === 0 ? setBackground("mapview") : setBackground("carousel")
        )
    }

    const libraryRenderItem = ( item ) => (

        <BottomSheetView style= {styles.libraryBoxItemsContainer} key= {item.key.toString()}>
            <TouchableOpacity style= {{flex: 1}} onPress= {() => handleLibraryItemClick(item.title)}>
                <BottomSheetView style= {styles.libraryBoxItemContentContainer}>
                    <Text>{item.content}</Text>
                </BottomSheetView>
                <BottomSheetView style= {styles.libraryBoxItemTitleContainer}>
                    <Text>{item.title}</Text>
                </BottomSheetView>
            </TouchableOpacity>
        </BottomSheetView>
    )

    const handleMapRegionChange = ( region: Region, details ) => {
        
        // let adjustedRegion = { ...region };

        // // Restrict zoom level
        // if (region.latitudeDelta > minZoomLevel || region.longitudeDelta > minZoomLevel) {
        //     adjustedRegion.latitudeDelta = minZoomLevel;
        //     adjustedRegion.longitudeDelta = minZoomLevel;
        // }

        // // Restrict panning
        // adjustedRegion.latitude = Math.min(Math.max(region.latitude, minLatitude), maxLatitude);
        // adjustedRegion.longitude = Math.min(Math.max(region.longitude, minLongitude), maxLongitude);

        // setMapRegion(adjustedRegion);
    }
    
    const handleRecentRenderItemClick = ( item ) => {
        
        recentNavigateRef.current?.navigate(item.content)
    }

    const handleSearchItemClick = ( item: SearchItem ) => {

        const place = campus.find((block) => block.id === item.key)
        mainRef.current?.snapToIndex(0)

        // setShowModal(true)
        try {
            
            (async () => {

                if (isCoordinateInBounds({lat: trackerPosition.lon, lon: trackerPosition.lat})) {

                    setCurrentPosition({ name: "Origin", lat: trackerPosition.lat, lon: trackerPosition.lon })
                    setDestinationPosition((prev) => ({...prev, id: item.key, name: place.officialName, lat: place.coord.lat, lon: place.coord.lon, placeID: place.placeID } ));

                } else {

                    Alert.alert(
                        "Warning",
                        "You must be on campus!",
                        [
                            { text: "OK", onPress: null }
                        ]
                    )
                }

                // animationRef.current.pause()
                setShowModal(false)
            })()

        } catch (error) {

            console.log("error with current position", error)
        }
    }

    const handleItemProfileClicked =( item ) => {

        setProfileClicked(item.content)
        if (item.content === "Logout") {

            Alert.alert(
                "Logout",
                "Are you sure ?",
                [
                    { text: "Yes", onPress: () => {
                            AsyncStorage.clear()
                                .then(() => {
                                    supabase.auth.signOut()
                                    navigation.navigate("signin")
                                })
                        }
                    },
                    { text: "No", style: "cancel" }
                ]
            );
        }
    }

    const handleShowProfileClosed = () => {

        setShowProfileModal(false)
        Alert.alert(
            "Confirmation",
            "Are you sure you want to update info.",
            [
                { text: "Update", onPress: () => {
                        if(!tempProfile.email?.match(/^\w+@[a-z]{3,}\.[a-z]+$/)) {

                            Alert.alert(
                                "Invalid Email",
                                "The email is invalid or no email provided",
                                [
                                    { text: "OK", style: "cancel" }
                                ]
                
                            )
                            setProfileInfo((prev) => (
                                {...prev, name: tempProfile.name.length > 0 ? tempProfile.name : prev.name}
                            ))
                        } else {
                            setProfileInfo((prev) => (
                                {...prev, email: tempProfile.email, name: tempProfile.name.length > 0 ? tempProfile.name : prev.name}
                            ))
                
                        }
                    } 
                },
                { text: "Cancel", style: "cancel" }
            ]
        );

    }

    const recentRenderItem = ( item ) => {

        return (
            <BottomSheetView style= {{...styles.recentItemContainer, backgroundColor: "#E7E7E6"}} key= {item.key}>
                <TouchableOpacity onPress= {() => handleRecentRenderItemClick(item)}>
                    <BottomSheetView style= {{flexDirection: "row"}}>
                        {item.icon}
                        <Text style= {{paddingLeft: 10, paddingTop: 5}}>{item.content}</Text>
                    </BottomSheetView>
                </TouchableOpacity>
            </BottomSheetView>
        )
    }

    const searchRenderItem = ( item ) => {

        return (
            <BottomSheetView style= {styles.recentItemContainer} key= {item.key}>
                <TouchableOpacity onPress= {() => handleSearchItemClick( item )}>
                    <BottomSheetView style= {{flexDirection: "row"}}>
                        {item.icon}
                        <Text style= {{paddingLeft: 10, paddingTop: 5}}>{item.content}</Text>
                    </BottomSheetView>
                </TouchableOpacity>
            </BottomSheetView>
        )
    }

    const findNearestNeighbour = ( checkPlace: Place ) => {

        const R = 6371000
        const φ1 = currentPosition.lat * Math.PI / 180
        const φ2 = parseFloat(checkPlace.coord.lat) * Math.PI / 180

        const Δφ = (parseFloat(checkPlace.coord.lat) - currentPosition.lat) * Math.PI / 180
        const Δλ = (parseFloat(checkPlace.coord.lon) - currentPosition.lon) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return { placeID: checkPlace.placeID, isFar: distance > 10, distance: distance }
    }

    const profileRenderItem = ( item ) => {

        return (
            <BottomSheetView style= {styles.recentItemContainer} key= {item.key}>
                <TouchableOpacity onPress= {() => handleItemProfileClicked(item)}>              
                    <BottomSheetView style= {{flexDirection: "row", alignItems: "center"}}>
                        {item.icon}
                        <BottomSheetView style= {{flex: 1, flexDirection: "row", justifyContent: "space-between"}}>
                            <Text style= {{paddingLeft: 10, paddingTop: 5, color: "#858585"}}>{item.content}</Text>
                            {item.arrow}
                        </BottomSheetView>
                    </BottomSheetView>
                </TouchableOpacity>
            </BottomSheetView>
        )
    }

    const RecentComponent = ( content  ) => {

        const navigation = content.navigation
        const recentC = content.route.params.content

        recentNavigateRef.current = navigation

        return (
            recentC.map(recentRenderItem)
        )
    }

    const LibraryComponent = ({ content }) => (
        <BottomSheetScrollView style= {styles.libraryBoxScrollContainer} horizontal>
            {content.map(libraryRenderItem)}
        </BottomSheetScrollView>
    )

    const SearchComponent = ({ content }) => (
        <BottomSheetView style= {styles.recentBoxViewContainer}>
            {content.map(searchRenderItem)}
        </BottomSheetView>
    )

    const AvatarComponent = ({ info }) => {

        if (showAvatar) {
            return (
                <BottomSheetView>
                    <Image source= {{uri: info.avatar}} style= {styles.headerProfileImage}/>
                </BottomSheetView>
            )
        }
        return (
            <View>
                <ChevronLeft width={"50"} height= {"40"} color= {"grey"}/>
            </View>
        )
    }

    const MapviewComponent = ({ prop }) => {

        useEffect(() => {
            setBackgroundID(0)

        }, [])

        return (
            <MapView style= {{flex: 1}} initialRegion= {initialRegion} region= {mapRegion} onRegionChangeComplete= {handleMapRegionChange} ref= {mapRef}>
                { destinationPosition.name && <Marker coordinate= {{latitude: destinationPosition.lat, longitude: destinationPosition.lon}} title= {destinationPosition.name} description= {"Destination"} pinColor= {"#4F85F6"}/> }
                { currentPosition.name && <Marker coordinate= {{latitude: currentPosition.lat, longitude: currentPosition.lon}} title= {currentPosition.name} description= {"Start"} pinColor= {"#78D3F8"}/> }
                { 
                trackerPosition.lat && 
                    (
                        <Marker coordinate= {{latitude: trackerPosition.lat, longitude: trackerPosition.lon}} title= {"Tracker"} >
                            <Image source= {require("../../assets/tracker.png")} style= {{width: 50, height: 50}}/>
                        </Marker> 
                    )
                }
                <UrlTile urlTemplate= {thunderForestURL } shouldReplaceMapContent= {true} shouldRasterizeIOS= {true}/>
                <Polyline coordinates={polylineCoordinates} strokeColor="orange" strokeWidth={2} lineDashPattern={[7, 5]} lineCap= {"round"} lineJoin= {"bevel"}/>
            </MapView>
        )
    }

    const CarouselComponent = ({ prop }) => {

        const carouselRef = useRef(null);
        const [activeIndex, setActiveIndex] = useState(0)

        const handleNext = () => {
            carouselRef.current?.next();
        };

        const handleEnd = () => {
            carouselRef.current?.scrollTo({ index: 5, animated: true });
        }
        
        const handleSnap = (index) => {
            setActiveIndex(index)
        }

        const renderItem = ( {item} ) => {
            // console.log(item)
            return (
                <View style= {carouselStyles.content}>
                    <Image source= {{uri: item}} style= {carouselStyles.imageBackground}/>
                </View>
            )
        }

        useEffect(() => {
            setBackgroundID(1)
        }, [])

        return (
            <View style={styles.container}>
                <View style={carouselStyles.carouselContainer}>
                    <Carousel loop width= {ITEM_WIDTH} height= {ITEM_HEIGHT} data= {carouselImages} renderItem= {renderItem} onSnapToItem= {handleSnap} style= {carouselStyles.carousel} ref= {carouselRef} />
                </View>
            </View>
        )

    }
    
    const ToggleComponent = () => {

        return (
            <View style= {{position: "absolute", marginTop: insets.current.top + 20, width: "100%", alignItems: "flex-end", paddingRight: 30}}>
                <View style= {{flexDirection: "column", padding: 5, borderRadius: 7, backgroundColor: "grey"}}>
                    <TouchableOpacity style= {{borderBottomWidth: 2, borderBottomColor: "lightgrey", padding: 2, paddingVertical: 7, justifyContent: "center", alignItems: "center"}} onPress= {() => handleToggleClick(0)}>
                        <Entypo name= "map" size= {20} color= {"lightgrey"}/>
                    </TouchableOpacity>
                    <TouchableOpacity style= {{padding: 2, paddingVertical: 7, justifyContent: "center", alignItems: "center"}} onPress= {() => handleToggleClick(1)}>
                        <Entypo name= "documents" size= {25} color= {"lightgrey"}/>
                    </TouchableOpacity>
                </View>
                <View>
                    {/* <Text>Hello World</Text> */}
                </View>
            </View>
        )
    }

    const BackgroundComponent = ({ which } : { which: "mapview" | "carousel" }) => {

        if (which === "mapview") {
            return (
                <MapviewComponent prop= {destinationPosition}/>
            )
        }
        return (
            <CarouselComponent prop= {destinationPosition}/>
        )
    }

    const DynamicRecentStack = ({ recentD } : { recentD: any[] }) => {

        const height = (HEIGHT * 0.056) * recentD.length
        const components = []

        const handleFacilityNameClick = ( facility ) => {

            setDescription({ name: facility.name, direction: facility.direction })
            setShowDescriptionModal(true)
        }

        recentD.forEach((obj) => {

            components.push(
                () => {

                    const facilities = campus.find((item) => item.id === destinationPosition.id)[obj.content.toLowerCase()]
                    return (
                        facilities.map((facility, id) => (
                            <BottomSheetView style= {{...styles.recentItemContainer, backgroundColor: "#E7E7E6"}} key= {id}>
                                    <BottomSheetView style= {{flexDirection: "row", justifyContent: "space-between"}}>
                                        <TouchableOpacity onPress= {() => handleFacilityNameClick(facility)}>
                                            <Text style= {{paddingLeft: 10, paddingRight: 100, paddingTop: 5}}>{facility.name}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress= {() => recentNavigateRef.current?.goBack()}>
                                            <Text style= {{paddingLeft: 10, paddingTop: 5}}>Go Back</Text>
                                        </TouchableOpacity>
                                    </BottomSheetView>
                            </BottomSheetView>
                        ))
                    )
                }
            )
        })

        const computeStack = useCallback(() => (
            <View style= {{...styles.recentBoxViewContainer, height: height}}>
                {
                    <BlockContainerStack.Navigator screenOptions= {{headerShown: false, cardStyle: {backgroundColor: "#E7E7E6"}}}>
                        <BlockContainerStack.Screen name= "block" component= {RecentComponent} initialParams= {{ content: recentD }} key= {0}/>
                        {
                            recentD.map((obj, index) => (
                                <BlockContainerStack.Screen name= {obj.content} component= {components[index]} initialParams= {{  }} key= {index + 1}/>
                            ))
                        }
                    </BlockContainerStack.Navigator>
                }
            </View>
        ), [recentD])

        return (
            computeStack()
        )
    }

    useEffect(() => {

        (async () => {
            
            const { status: checkStatus }  = await Location.getForegroundPermissionsAsync()
            if (checkStatus !== "granted") {

                const { status: requestStatus } = await Location.requestForegroundPermissionsAsync()
                if (requestStatus !== "granted") {
                    Alert.alert(
                        "Permission Required",
                        "Location permission is needed to use this app. Please enable it in the settings.",
                        [
                            { text: "Open Settings", onPress: () => {
                                    (async () => {
                                        const canOpen = await Linking.canOpenURL("app-settings:")
                                        if (canOpen) {
                                            await Linking.openSettings()
                                        }
                                    })()
                                } 
                            },
                            { text: "Cancel", style: "cancel" }
                        ]
                    );
                }
            }

            const locationSubscription = await Location.watchPositionAsync(
                {
                    timeInterval: 10,
                    distanceInterval: 5,
                    accuracy: Location.Accuracy.Highest
                }, (location) => {
                    setTrackerPosition( {lat: location.coords.latitude, lon: location.coords.longitude, name: null} )
                }
            )

        })()

        supabase.auth.getSession()
            .then(({ data }) => {

                setProfileInfo((prev) => (
                    {...prev, name: data.session.user.user_metadata.full_name, email: data.session.user.new_email ? data.session.user.new_email : data.session.user.email, avatar: data.session.user.user_metadata.avatar_url}
                ))
            })
            .catch((reason) => {
                console.log(reason)
            })
            
        setRender({which: "original", render: originalContent})
        setBackground("mapview")


    }, [])

    useEffect(() => {

        campus.forEach((block) => {
            block.names.forEach((name) => {
                names[name] = block.id
            }) 
            block.facilities.forEach((facility) => {
                const check = facilities[facility] || []
                facilities[facility] = [...check, block.id]
            })
        })

    }, [])

    useEffect(() => {

        setRender(render.which === "search" ? {which: "search", render: searchContent} : {which: "original", render: originalContent})
    }, [searchData])

    useEffect(() => {
        
        if (textInputValue?.length === 0) {
            setRender({which: "original", render: originalContent})
        }

    }, [recentData])

    useEffect(() => {

        // console.log(trackerPosition)
    }, [trackerPosition])

    useEffect(() => {

        profileClicked && profileScreenNav.current?.navigate(profileClicked.toLowerCase())
        setProfileClicked(null)
    }, [profileClicked])

    useEffect(() => {

        if (backgroundID === 0) {
            setSnapPoints(
                ["12%", "30%", "90%"]
            )
        } else {
            setSnapPoints(
                ["60%", "90%"]
            )
        }
    }, [backgroundID])

    useEffect(() => {
        
        setRecentData([])
        setCarouselImages([])

        const infrastructure = campus.find((obj) => obj.id === destinationPosition.id)
        infrastructure && infrastructure.facilities.forEach((value, index) => {
            setRecentData((prevData) => (
                [...prevData, {key: index, content: value.charAt(0).toUpperCase() + value.slice(1)}]
            ))
        })

        if (destinationPosition.id !== null) {

            const facilities = ["foe", "fbne", "ccb", "as", "getfund", "tennis", "bball", "adb", "ad", "fbms", "gcb", "sg", "compssa"]
            const unique = infrastructure.names.filter((name) => facilities.includes(name))

            const transformations = [
                { width: ITEM_WIDTH, height: ITEM_HEIGHT }
            ]
        

            Array.from(
                { length: infrastructure.images },
                (iter, index) => {

                    const path = `/${unique}-${index + 1}.jpg`
                    setCarouselImages((prev) => (
                        [...prev, getImagekitUrlFromPath(path, transformations)]
                    ))

                }
            );

            (
                async () => {
                   await fetchDirections()
                }
            )()
        }

        infrastructure && (
            setInitialRegion((prev) => (
                {...prev, latitude: Number.parseFloat(infrastructure.coord.lat), longitude: Number.parseFloat(infrastructure.coord.lon)}
            ))
        )

    }, [destinationPosition])

    useEffect(() => {

        (profileInfo.name && profileInfo.email) && (
            supabase.auth.updateUser({ email: profileInfo.email, data: { name: profileInfo.name }})
                .then((value) => {
                    //
                })
        )

    }, [profileInfo])

    const originalContent = (

        <BottomSheetScrollView style= {styles.scrollContainer}>
            <BottomSheetView style= {styles.libraryContainer}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <Text style= {styles.libraryTitleText}>Library</Text>
                </BottomSheetView>
                <LibraryComponent content= {data}/>
            </BottomSheetView>

            <BottomSheetView style= {{...styles.facilityContainer, minHeight: HEIGHT * 0.09}}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <BottomSheetView style= {{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style= {styles.libraryTitleText}>Block Facility</Text>
                    </BottomSheetView>
                </BottomSheetView>

                <DynamicRecentStack recentD={recentData}/>

            </BottomSheetView>

            <TouchableOpacity>
                <BottomSheetView style= {styles.othersContainer}>
                    <BottomSheetView style= {styles.othersBoxIconContainer}>
                        <Entypo name= "direction" size= {30} color= {"#5AC4F7"}/>
                    </BottomSheetView>
                    <BottomSheetView style= {styles.othersBoxTextContainer}>
                        <Text>Share Location</Text>
                    </BottomSheetView>
                </BottomSheetView>
            </TouchableOpacity>

            <TouchableOpacity>
                <BottomSheetView style= {styles.othersContainer}>
                    <BottomSheetView style= {styles.othersBoxIconContainer}>
                        <Entypo name= "bug" size= {30} color= {"red"}/>
                    </BottomSheetView>
                    <BottomSheetView style= {styles.othersBoxTextContainer}>
                        <Text>Report Issue</Text>
                    </BottomSheetView>
                </BottomSheetView>
            </TouchableOpacity>
        </BottomSheetScrollView>
    )

    const searchContent = (

        <BottomSheetScrollView style= {styles.scrollContainer}>

            <BottomSheetView style= {{...styles.facilityContainer, marginTop: 0}}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <Text style= {styles.libraryTitleText}>Search Result</Text>
                </BottomSheetView>
                <SearchComponent content= {searchData}/>
            </BottomSheetView>

        </BottomSheetScrollView>
    )

    return (
        <View style= {styles.container}> 
                <View style= {styles.mapContainer}>
                    <BackgroundComponent which= {background}/>
                    <ToggleComponent/>
                    <ModalBox isOpen={showModal} onClosed={() => setShowModal(false)} style= {styles.modalBox}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <LottieView source= {animation} autoPlay loop style= {{width: 100, height: 100}} ref= {animationRef}/>
                        </View>
                    </ModalBox>
                    <ModalBox isOpen={showDescriptionModal} onClosed={() => setShowDescriptionModal(false)} style={styles.directionsBox}>
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <View style= {{width: WIDTH * 0.65, minHeight: HEIGHT * 0.125, borderRadius: 7, backgroundColor: "lightgrey", paddingLeft: 5}}>
                                <View style= {{flexDirection: "row", marginTop: 10}}>
                                    <Text style= {{fontSize: 13, fontWeight: "bold", marginRight: 10}}>FacilityName</Text>
                                    <Text>{description.name}</Text>
                                </View>
                                <View>
                                    <Text style= {{fontSize: 13, fontWeight: "bold"}}>Description</Text>
                                    <Text>{description.direction}.</Text>
                                </View>
                            </View>
                        </View>
                    </ModalBox>
                    <ModalBox isOpen={showProfileModal} onClosed={handleShowProfileClosed} style={styles.directionsBox}>
                        <View style={{ justifyContent: "center", alignItems: "center" }}>
                            <TextInput placeholder= {"Full Name"} value= {tempProfile.name} onChangeText= {(text) => setTempProfile((prev) => ({...prev, name: text}))} style= {{borderWidth: 1, borderColor: "darkgrey", width: WIDTH * 0.6, height: 25, marginBottom: 5, borderRadius: 5, paddingLeft: 5}}/>
                            <TextInput placeholder= {"Email"} value= {tempProfile.email} onChangeText= {(text) => setTempProfile((prev) => ({...prev, email: text}))} style= {{borderWidth: 1, borderColor: "darkgrey", width: WIDTH * 0.6, height: 25, borderRadius: 5, paddingLeft: 5}}/>
                        </View>
                    </ModalBox>
                    <BottomSheet snapPoints= {snapPoints} keyboardBehavior= {"extend"} onChange= {handleMainChange} ref= {mainRef}>
                        <BottomSheetView style= {styles.headerContainer}>
                            <BottomSheetView style= {styles.textinputContainer}>
                                <Entypo name= "magnifying-glass" size= {20} color= {"gray"} style= {{ marginRight: 3 }} />
                                <BottomSheetTextInput placeholder= {"Search Maps"} keyboardAppearance= {"default"} keyboardType= {"ascii-capable"} style= {styles.headerTextInput} clearTextOnFocus onEndEditing= {handleTextInputFinish} onChangeText= {handleTextInputChange} spellCheck= {false} autoCorrect= {false} autoComplete= {"off"} value= {textInputValue} ref= {inputRef} onPress= {handleTextInputPress}/>
                            </BottomSheetView>

                            <TouchableOpacity style= {styles.profileContainer} onPress= {handleProfilePress}>
                                <AvatarComponent info= {profileInfo}/>
                            </TouchableOpacity>

                        </BottomSheetView>

                        {render.render}
                    </BottomSheet>
                    {
                        profileVisible && (
                            <BottomSheet ref= {profileRef} snapPoints={["30%"]} handleComponent= {null} style= {{borderRadius: 15}}>
                                <BottomSheetView style= {styles.profileSheetContainer}>
                                    <BottomSheetView style= {styles.profileSheetHeaderContainer}>
                                        <TouchableOpacity style= {styles.profileSheetHeaderImageContainer}>
                                            <Image source= {{ uri: profileInfo.avatar }} style= {styles.profileSheetHeaderImageContainer}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity style= {styles.profileSheetHeaderMainContainer} onPress= {() => setShowProfileModal(true)}>
                                            <Text style= {{fontSize: 20, fontWeight: "bold"}}>{profileInfo.name}</Text>
                                            <Text>{profileInfo.email}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress= {handleProfileClose}>
                                            <BottomSheetView style= {styles.profileSheetHeaderCloseContainer}>
                                                <Entypo name= "circle-with-cross" size= {30} color= {"#858585"}/>
                                            </BottomSheetView>
                                        </TouchableOpacity>
                                    </BottomSheetView>
                                    <BottomSheetView style= {styles.profileSheetContentContainer}>
                                            <BottomSheetView style= {styles.profileSheetContentBoxView}>
                                                {profileData.map(profileRenderItem)}
                                            </BottomSheetView>
                                    </BottomSheetView>
                                </BottomSheetView>
                            </BottomSheet>
                        )
                    }
                </View>
        </View>
    )
}

export const Main = () => {
    const MainContainerStack = createStackNavigator();
    const options = {
        headerShown: false
    }
    return (
        <MainContainerStack.Navigator screenOptions= {options}>
            <MainContainerStack.Screen name="landing" component= {LandingScreen}/>
            <MainContainerStack.Screen name="signin" component= {SignInScreen} />
            <MainContainerStack.Screen name="signup" component= {SignUpScreen} />
            <MainContainerStack.Screen name="main" component= {MainScreen} />
        </MainContainerStack.Navigator>
    )
}

const styles  = StyleSheet.create(
    {
        container: {
            flex: 1,
            // justifyContent: "center",
        },
        mapContainer: {
            flex: 1,
            // backgroundColor: "orange"
        },
        navbarContainer: {
            flex: 0.1,
            flexDirection: "row-reverse",
            backgroundColor: "pink"
        },
        headerContainer: {
            flexDirection: "row",
            marginBottom: 25
        },
        textinputContainer: {
            flex: 1,
            flexDirection: "row",
            padding: 7,
            paddingBottom: 7,
            backgroundColor: "#E7E7E6",
            borderRadius: 10,
            margin: 10,
            marginRight: 0,
            alignItems: "center",
        },
        profileContainer: {
            flex: 0.2,
            justifyContent: "center",
            alignItems: "center",
        },
        scrollContainer: {
            flex: 1,
        },
        libraryContainer: {
            flexDirection: "column",
        },
        libraryTitleContainer: {
            paddingLeft: 10
        },
        libraryBoxScrollContainer: {
            flex: 1,
            flexDirection: "row",
            paddingHorizontal: 10,
            marginBottom: 10,
            marginHorizontal: 10,
            borderRadius: 10,
            // borderWidth: 1,
            minHeight: WIDTH * 0.25,
            backgroundColor: "#E7E7E6",
        },
        libraryBoxItemsContainer: {
            flexDirection: "column",
            marginRight: 10,
        },
        libraryBoxItemContentContainer: {
            flex: 1,
            marginTop: 10,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            aspectRatio: 1,
            backgroundColor: "#858585"
        },
        libraryBoxItemTitleContainer: {
            flex: 0.3,
            alignItems: "center",
            justifyContent: "center",
        },
        libraryTitleText: {
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 5
        },
        recentBoxViewContainer: {
            flex: 1,
            paddingHorizontal: 10,
            marginBottom: 10,
            marginHorizontal: 10,
            borderRadius: 10,
            // borderWidth: 1,
            minHeight: HEIGHT * 0.056,
            backgroundColor: "#E7E7E6",

        },
        facilityContainer: {
            marginTop: 20,
            flexDirection: "column",
        },
        recentItemContainer: {
            paddingTop: 20,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            justifyContent: "center",
        },
        othersContainer: {
            flex: 1,
            flexDirection: "row",
            padding: 10,
            paddingBottom: 10,
            marginVertical: 10,
            marginHorizontal: 10,
            borderRadius: 10,
            // borderWidth: 1,
            minHeight: WIDTH * 0.1,
            justifyContent: "flex-start",
            alignItems: "center",
            backgroundColor: "#E7E7E6",
        },
        othersBoxIconContainer: {
            borderRadius: 7,
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 10,
            backgroundColor: "white"

        },
        othersBoxTextContainer: {
            marginLeft: 10
        },
        headerTextInput: {
            width: "90%",
            height: "100%"
        },
        headerProfileImage: {
            width: WIDTH * 0.11,
            height: HEIGHT * 0.05,
            borderRadius: 50
        },
        profileSheetContainer: {
            flex: 1
        },
        profileSheetHeaderContainer: {
            flexDirection: "row",
            margin: 10,
            marginTop: 20,
        },
        profileSheetHeaderImageContainer: {
            width: WIDTH * 0.11,
            height: HEIGHT * 0.05,
            borderRadius: 50
        },
        profileSheetHeaderMainContainer: {
            flex: 1,
            flexDirection: "column",
            marginLeft: 10,
        },
        profileSheetHeaderCloseContainer: {

        },
        profileSheetContentContainer: {
            flex: 1,
        },
        profileSheetContentBoxView: {
            paddingHorizontal: 10,
            marginBottom: 10,
            marginHorizontal: 10,
            borderRadius: 10,
            backgroundColor: "#E7E7E6",
        },
        modalBox: {
            justifyContent: "center",
            alignItems: "center",
            // width: 120,
            // height: 120,
            backgroundColor: "transparent",
            borderRadius: 13
        },
        directionsBox: {
            justifyContent: "center",
            alignItems: "center",
            width: WIDTH * 0.7,
            minHeight: HEIGHT * 0.13,
            maxHeight: HEIGHT * 0.15,
            backgroundColor: "#fff",
            borderRadius: 13
        }
    }
)

const carouselStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        // justifyContent: "center",
        // alignItems: "center",
        // marginRight: 20,
        // borderWidth: 1, // the actual border
        // borderRadius: 5,
    },
    carouselContainer: {
        height: ITEM_HEIGHT
    },
    carousel: {
        width: WIDTH
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        minHeight: 50,
    },
    imageBackground: {
        width: ITEM_WIDTH * 0.99,
        height: ITEM_HEIGHT * 0.9,  // changes the height of the image
        justifyContent: "center",
        alignItems: "center",
        // overflow: "hidden"

    }

})