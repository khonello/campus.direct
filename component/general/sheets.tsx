import { View, Text, StyleSheet, Dimensions, PixelRatio, TouchableOpacity, TouchableWithoutFeedback, ImageBackground, Button, Alert, Linking, Keyboard } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ChevronLeft } from "./svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStackNavigator } from '@react-navigation/stack';
import ModalBox from "react-native-modalbox";
import MapView, { UrlTile, PROVIDER_DEFAULT, Marker, Circle, Region } from 'react-native-maps';
import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import BottomSheet, { BottomSheetView, BottomSheetTextInput, BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import LottieView from "lottie-react-native";
import Carousel from "react-native-reanimated-carousel";
import debounce from "lodash.debounce";
import * as Location from "expo-location";
import * as FileSystem from "expo-file-system";

const WIDTH = Dimensions.get("window").width
const HEIGHT = Dimensions.get("window").height
const ITEM_WIDTH = WIDTH * 0.8
const ITEM_HEIGHT = HEIGHT * 0.37

const names = {}
const facilities = {}
const animation = require("../../assets/loader.json")

const MainScreen = () => {

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

    const ProfileContainerStack = createStackNavigator()
    const BlockContainerStack = createStackNavigator()
    
    const [recentStackData, setRecentStackData] = useState(null)
    
    const insets = useRef(useSafeAreaInsets())
    const googleMapsURL = "https://maps.googleapis.com/maps/api/"
    const googleMapsAPIkey = Constants.manifest2.extra.expoClient.extra.googleMapsApiKey
    const campus = [
        { id: 1, names: ["foe", "faculty of engineering", "engineering block"], facilities: ["washroom", "office", "lab"], washroom: ["washroom_1", "washroom_2"], office: ["office_1"], lab: ["lab_1"], officialName: "Faculty Of Engineering", placeID: "ChIJ-f_vcYFq3w8RB-jHZuqSA0Q", coord: {lat: "6.0645867", lon: "-0.2658555"} },
        { id: 2, names: ["fbne", "faculty of built and natural environment"], facilities: ["office", "hall"], office: ["office_1"], hall: [], officialName: "Faculty of Built and Natural Environment", placeID: "ChIJjRNljXdr3w8RmfE2dCRNU5I", coord: {lat: "6.065277499999999", lon: "-0.2657916"} },
        { id: 3, names: ["ccb", "central classroom block"], facilities: ["library", "office"], library: [], office: ["office_1"], officialName: "Central Classroom Block", placeID: "ChIJTRlU9IBq3w8RJBZ1hdU3eQQ", coord: {lat: "6.0650474", lon: "-0.2633137"} },
        { id: 4, names: ["as", "applied science"], facilities: ["office", "hall"], office: ["office_1"], hall: [], officialName: "Applied Science", placeID: "ChIJvffQqIFq3w8RS9zAMHcllvA", coord: {lat: "6.0655414", lon: "-0.2647885"} },
        { id: 5, names: ["getfund"], facilities: ["supermarket"], supermarket: [], officialName: "GetFund", placeID: "ChIJYdqTyIZq3w8RQBZzxr_cN2s", coord: {lat: "6.0619622", lon: "-0.2653302"} },
        { id: 6, names: ["tennis"], facilities: ["court"], court: [], officialName: "Tennis", placeID: "ChIJUzNi3vBr3w8R2ZBtUl0JYIo", coord: {lat: "6.0610236", lon: "-0.2641309"} },
        { id: 7, names: ["basket ball"], facilities: ["court"], court: [], officialName: "Basket Ball", placeID: "ChIJb9Uaq4Fq3w8RWMMfJx3oHgI", coord: {lat: "6.065430500000001", lon: "-0.2645425"} },
        { id: 8, names: ["adb", "agriculture development bank", "atm"], facilities: [], officialName: "Agriculture Development Bank ATM", placeID: "ChIJHUgeNzVA3w8RhtgdHTd9DX8", coord: {lat: "6.0648173", lon: "-0.2654369999999999"} },
        { id: 9, names: ["gcb", "ghana commercial bank", "atm"], facilities: [], officialName: "Ghana Commercial Bank ATM", placeID: "ChIJV7-LHshr3w8Re6XgDWGQ5F0", coord: {lat: "6.0650265", lon: "-0.2647094"} },
        { id: 10, names: ["radio"], facilities: [], officialName: "Radio 87.7Mhz", placeID: "ChIJx_fIG4Fq3w8R50I78KKrX6Y", coord: {lat: "6.064370299999999", lon: "-0.2647297"} },
        { id: 11, names: ["mosque"], facilities: [], officialName: "Central Mosque", placeID: "ChIJA5Bdpltr3w8RthAWfIzH2iI", coord: {lat: "6.0616846", lon: "-0.2659554"} },
        { id: 12, names: ["bm", "business management"], facilities: [], officialName: "Business Management Block", placeID: "ChIJUeMjxxtr3w8RdoxeLH3oXm4", coord: {lat: "6.065186800000001", lon: "-0.2640584"} },
        { id: 13, names: ["ad"], facilities: [], officialName: "AD Block ( Old Administration Block )", placeID: "ChIJVdBtEIFq3w8RrqQRORv2e5M", coord: {lat: "6.0644443", lon: "-0.2649825"} },
        { id: 14, names: ["fhas", "faculty of health and allied science"], facilities: [], officialName: "Faculty of Health and Allied Science", placeID: "ChIJs7TEQwBr3w8RgcqYXb0sLcA", coord: {lat: "6.0651838", lon: "-0.2628565"} },
        { id: 15, names: ["fbms", "faculty of business and management studies"], facilities: [], officialName: "Faculty of Business and Management Studies", placeID: "ChIJIejocABr3w8RzW3tHkyur0w", coord: {lat: "6.065087", lon: "-0.2639526"} },
        { id: 16, names: ["kitchen"], facilities: [], officialName: "Hospitality Kitchen", placeID: "ChIJlyYZ-IBq3w8RY0WCoEmTkbs", coord: {lat: "6.065131899999999", lon: "-0.2637737"} },
        { id: 17, names: ["societe generale"], facilities: [], officialName: "Societe Generale Ghana", placeID: "ChIJ93o3o1xr3w8RsSTxJL6cHkw", coord: {lat: "6.0646713", lon: "-0.2649737"} },
    ]

    const [showAvatar, setShowAvatar] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [snapPoints, setSnapPoints] = useState(
        ["12%"]
    )
    const [render, setRender] = useState({which: "original", render: null}) 
    const [textInputValue, setTextInputValue] = useState(null)
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
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
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
    const [destinationPosition, setDestinationPosition] = useState( {title: null, location: {lat: null, lon: null}, northEast: {lat: null, lon: null}, southWest: {lat: null, lon: null} } )
    const [currentPosition, setCurrentPosition] = useState( {lat: null, lon: null} )
    const [currentID, setCurrentID] = useState(-1)
    const [closetPlaceID, setClosetPlaceID] = useState(null)
    const [backgroundID, setBackgroundID] = useState(0)
    // const [backgroundContent, setBackgroundContent] = useState(null)

    const mainRef = useRef<BottomSheet>(null)
    const profileRef = useRef<BottomSheet>(null)
    const recentNavigateRef = useRef(null)

    const inputRef = useRef<typeof BottomSheetTextInput>(null)
    const animationRef = useRef<LottieView>(null)
    const debouncedDelay = useRef(1000)

    const thunderForestURL = "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=d0051eac5a6b44fabc51ab2f9a669c6e"
    const openstreetURL = "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
    const profileData = [
        {key: 1, icon:<Entypo name= "grid" size= {30} color= {"#858585"}/>, content:  "Library", arrow: <Entypo name= "chevron-small-right" size= {20} color= {"#858585"}/>},
        {key: 2, icon: <Entypo name= "info" size= {30} color= {"#858585"}/>, content: "Preference", arrow: <Entypo name= "chevron-small-right" size= {20} color= {"#858585"}/>},
        {key: 3, icon: <Entypo name= "arrow-left" size= {30} color= {"#858585"}/>, content: "Logout", arrow: <Entypo name= "chevron-small-left" size= {20} color= {"#858585"}/>}
    ]

    const minZoomLevel = 0.005; // Adjust this value to set the minimum zoom level
    const maxLatitude = 6.07; // Set the maximum latitude for the restricted area
    const minLatitude = 6.05; // Set the minimum latitude for the restricted area
    const maxLongitude = -0.26; // Set the maximum longitude for the restricted area
    const minLongitude = -0.27; // Set the minimum longitude for the restricted area

    const debouncedSearch = useMemo(
        () => debounce((text) => performSearch(text), debouncedDelay.current),
    [])
    const profileScreenNav = useRef(null)

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

    const performSearch = ( text: string ) => {

        let lowerCase = text.toLowerCase().trim()
        setRecentData([])
        
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
                                    console.log("found these", ...look)

                                IDsKey.add({ id: id, key: key })
                            });
                        } else {

                            IDsKey.add({ id: infrastructureID, key: null })
                        }
                    }
                } else {

                    campus.forEach((block) => {
                        block.facilities.forEach((facility) => {

                            if (block[facility].includes(lowerCase)) {
                                
                                const look = block[facility].find((name) => name === lowerCase)
                                look && IDsKey.add({ id: block.id, key: `${facility}, ${look}` })
                            }
                        })
                    })
                }
            })
            IDsKey.forEach((IDkey) => {

                const infrastructure = campus.find((item) => item.id == IDkey.id)
                infrastructure.facilities.forEach((value, index) => {
                    setRecentData((prevData) => (
                        [...prevData, {key: index, content: value}]
                    ))
                })

                searches.add(JSON.stringify({key: IDkey.id, content: `${infrastructure.officialName}${IDkey.key ? `, ${IDkey.key}` : ""}`, icon: ""}))
            })

            searches.forEach((data: string) => {
                setSearchData((prevData) => (
                    [...prevData, JSON.parse(data)]
                ))
            })

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

        // setTextInputValue(title)
        // handleTextInputPress()
        // debouncedSearch(title)

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
        
        let adjustedRegion = { ...region };

        // Restrict zoom level
        if (region.latitudeDelta > minZoomLevel || region.longitudeDelta > minZoomLevel) {
            adjustedRegion.latitudeDelta = minZoomLevel;
            adjustedRegion.longitudeDelta = minZoomLevel;
        }

        // Restrict panning
        adjustedRegion.latitude = Math.min(Math.max(region.latitude, minLatitude), maxLatitude);
        adjustedRegion.longitude = Math.min(Math.max(region.longitude, minLongitude), maxLongitude);

        setMapRegion(adjustedRegion);
    }
    
    const handleRecentRenderItemClick = ( item ) => {
        
        recentNavigateRef.current?.navigate(item.content)
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

        interface Item {
            key: number,
            icon: string,
            content: string
        }
        const copy: Item = item
        const split = copy.content.split(",")

        const placeID = campus.find((block) => block.id === copy.key).placeID

        const [block, facility = null, name = null] = split
        const format = "json"
        const urlPath = "place/details/"
        const queryParams = new URLSearchParams(`key=${googleMapsAPIkey}&place_id=${placeID}`)
        const urlEndpoint = `${googleMapsURL}${urlPath}${format}?${queryParams.toString()}`

        const fetchInfo = () => {

            mainRef.current?.snapToIndex(2)
            setShowModal(true);
            setCurrentID(copy.key);

            (async () => {
 
                const response = await fetch(urlEndpoint)
                if (response.status === 200) {

                    response.json()
                        .then((value) => {
                            
                            const placeGeometry = value.result.geometry

                            setDestinationPosition({ title: block, location: { lat: placeGeometry.location.lat, lon: placeGeometry.location.lng }, northEast: { lat: placeGeometry.viewport.northeast.lat, lon: placeGeometry.viewport.northeast.lng }, southWest: { lat: placeGeometry.viewport.southwest.lat, lon: placeGeometry.viewport.southwest.lng } });
                            Location.getCurrentPositionAsync()
                                .then((location) => {
                                    
                                    setCurrentPosition({ lat: location.coords.latitude, lon: location.coords.longitude })
                                    setShowModal(false)
                                    mainRef.current?.snapToIndex(1)
                                })
                                .catch((reason) => {
                                    console.log("error with current position", reason)
                                })
                        })
                        .catch((reason) => {
                            console.log("error with place position", reason)
                        })
 
                } else {
                    animationRef.current.pause()
                    setShowModal(false)
                }
                
            })()
        }

        return (
            <BottomSheetView style= {styles.recentItemContainer} key= {item.key}>
                <TouchableOpacity onPress= {() => fetchInfo()}>
                    <BottomSheetView style= {{flexDirection: "row"}}>
                        {item.icon}
                        <Text style= {{paddingLeft: 10, paddingTop: 5}}>{item.content}</Text>
                    </BottomSheetView>
                </TouchableOpacity>
            </BottomSheetView>
        )
    }

    const findNearestNeighbour = (checkPlace: Place) => {

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

    const profileRenderItem = ( item ) => (
        
            <BottomSheetView style= {styles.recentItemContainer} key= {item.key}>
                <TouchableOpacity onPress= {() => setProfileClicked(item.content)}>              
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

    const RecentComponent = ( content  ) => {

        const navigation = content.navigation
        const recentC = content.route.params.content

        recentNavigateRef.current = navigation

        return (
            recentC.map(recentRenderItem)
        )
    }

    const LibraryComponent = ( { content } ) => (
        <BottomSheetScrollView style= {styles.libraryBoxScrollContainer} horizontal>
            {content.map(libraryRenderItem)}
        </BottomSheetScrollView>
    )

    const SearchComponent = ( { content } ) => (
        <BottomSheetView style= {styles.recentBoxViewContainer}>
            {content.map(searchRenderItem)}
        </BottomSheetView>
    )

    const AvatarComponent = () => {

        if (showAvatar) {
            return (
                <BottomSheetView>
                    <Image source= {require("../../assets/avatar.png")} style= {styles.headerProfileImage}/>
                </BottomSheetView>
            )
        }
        return (
            <View>
                <ChevronLeft width={"50"} height= {"40"} color= {"grey"}/>
            </View>
        )
    }

    const MapviewComponent = () => {

        useEffect(() => {
            return () => {
                setBackgroundID(0)
            }
        }, [])

        return (
            <MapView style= {{flex: 1}} initialRegion= {{latitude: 6.063400336337259, longitude: -0.26424994084753095, latitudeDelta: 0.005, longitudeDelta: 0.005}} region= {mapRegion} onRegionChangeComplete= {handleMapRegionChange} minZoomLevel= {16}>
                { destinationPosition.title && <Marker coordinate= {{latitude: destinationPosition.location.lat, longitude: destinationPosition.location.lon}} title= {destinationPosition.title} description= {"Hell"}></Marker> }
                { currentPosition.lat && <Marker coordinate= {{latitude: currentPosition.lat, longitude: currentPosition.lon}} title= {"Title"} description= {"Hell"}></Marker> }
                <UrlTile urlTemplate= {thunderForestURL } shouldReplaceMapContent= {true} shouldRasterizeIOS= {true} maximumZ= {16}/>
            </MapView>
        )
    }

    const CarouselComponent = () => {

        const data = [...new Array(6).keys()];
        const carouselRef = useRef(null);
        const insets = useSafeAreaInsets()

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
            return (
                <View style= {carouselStyles.content}>
                    <ImageBackground /* source= {require("../../assets/img/favicon.png")} */style= {carouselStyles.imageBackground}>
                        <Text>Hello World</Text>
                    </ImageBackground>
                </View>
            )
        }

        useEffect(() => {
            return () => {
                setBackgroundID(1)
            }
        }, [])

        return (
            <View style={styles.container}>
                <View style={carouselStyles.carouselContainer}>
                    <Carousel loop width= {ITEM_WIDTH} height= {ITEM_HEIGHT} data= {data} renderItem= {renderItem} onSnapToItem= {handleSnap} style= {carouselStyles.carousel} ref= {carouselRef} />
                </View>
                <View style={carouselStyles.buttons}>
                    <Button title= "Next" onPress= {handleNext}/>
                    <Button title= "End" onPress= {handleEnd}/>
                </View>
            </View>
        )

    }

    const ProfileMainScreen = ( {navigation} ) => {

        profileScreenNav.current = navigation
        return (
            <BottomSheetView style= {styles.profileSheetContentBoxView}>
                {profileData.map(profileRenderItem)}
            </BottomSheetView>
        )
    }

    const ProfileLibraryScreen = ( {navigation} ) => {

        const change = () => {
            navigation.goBack()
        }
        return (
            <BottomSheetView style= {styles.profileSheetContentBoxView}>
                <TouchableOpacity onPress= {change}>
                    <Text>Library</Text>
                </TouchableOpacity>
            </BottomSheetView>
        )
    }
    
    const ProfilePreferenceScreen = ( {navigation} ) => {

        const change = () => {
            navigation.goBack()
        }
        return (
            <BottomSheetView style= {styles.profileSheetContentBoxView}>
                <TouchableOpacity onPress= {change}>
                    <Text>Preference</Text>
                </TouchableOpacity>
            </BottomSheetView>
        )
    }

    const ProfileLogoutScreen = ( {navigation} ) => {

        const change = () => {
            navigation.goBack()
        }
        return (
            <BottomSheetView style= {styles.profileSheetContentBoxView}>
                <TouchableOpacity onPress= {change}>
                    <Text>Logout</Text>
                </TouchableOpacity>
            </BottomSheetView>
        )
    }

    const DynamicRecentStack = ({ recentD }) => {

        const height = (HEIGHT * 0.056) * recentD.length
        const components = []

        recentD.forEach((obj) => {
            components.push(
                () => {
                    return (
                        <TouchableOpacity onPress= {() => recentNavigateRef.current?.goBack()} style= {{backgroundColor: "red"}}>
                            <Text>{obj.content}</Text>
                        </TouchableOpacity>
                    )
                }
            )
        })
        console.log(components)
        return (
            <View style= {{...styles.recentBoxViewContainer, height: height, backgroundColor: "purple"}}>
                    <BlockContainerStack.Navigator screenOptions= {{headerShown: false}}>
                        <BlockContainerStack.Screen name= "main" component= {RecentComponent} initialParams= {{ content: recentD }} key= {0}/>
                        {
                            recentD.map((obj, index) => (
                                <BlockContainerStack.Screen name= {obj.content} component= {components[index]} initialParams= {{  }} key= {index + 1}/>
                            ))
                        }
                    </BlockContainerStack.Navigator>
            </View>
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

        })()
        setRender({which: "original", render: originalContent})
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

        const distances = []
        if (currentID !== -1) {
            campus.forEach((place: Place) => {

                const checkNeighbour = findNearestNeighbour(place)
                checkNeighbour.isFar && distances.push(checkNeighbour)
            })
        }
        distances.sort((a, b) => {

            if (a.distance === b.distance) {

                return 0
            } else if (a.distance < b.distance) {

                return -1
            } 
            return 1
        })
        distances.length > 0 && setClosetPlaceID(distances[0])

    }, [currentPosition])

    useEffect(() => {

        console.log(closetPlaceID)
    }, [closetPlaceID])

    useEffect(() => {

        profileClicked && profileScreenNav.current?.navigate(profileClicked.toLowerCase())
        setProfileClicked(null)
    }, [profileClicked])

    useEffect(() => {
        console.log("change made!")
        if (backgroundID === 0) {
            setSnapPoints(
                ["12%", "30%", "90%"]
            )
        } else {
            setSnapPoints(
                ["65%", "90%"]
            )
        }
    }, [backgroundID])

    useEffect(() => {

        // console.log(recentStackData)
    }, [recentStackData])
    // useEffect(() => {

    //     console.log(destinationPosition)
    // }, [destinationPosition])

    const originalContent = (

        <BottomSheetScrollView style= {styles.scrollContainer}>
            <BottomSheetView style= {styles.libraryContainer}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <Text style= {styles.libraryTitleText}>Library</Text>
                </BottomSheetView>
                <LibraryComponent content= {data}/>
            </BottomSheetView>

            <BottomSheetView style= {{...styles.facilityContainer}}>
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
                <MapviewComponent/>
                <ModalBox isOpen={showModal} onClosed={() => setShowModal(false)} style= {styles.modalBox}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <LottieView source= {animation} autoPlay loop style= {{width: 100, height: 100}} ref= {animationRef}/>
                    </View>
                </ModalBox>
                <BottomSheet snapPoints= {snapPoints} keyboardBehavior= {"extend"} onChange= {handleMainChange} ref= {mainRef}>
                    <BottomSheetView style= {styles.headerContainer}>
                        <BottomSheetView style= {styles.textinputContainer}>
                            <Entypo name= "magnifying-glass" size= {20} color= {"gray"} style= {{ marginRight: 3 }} />
                            <BottomSheetTextInput placeholder= {"Search Maps"} keyboardAppearance= {"default"} keyboardType= {"ascii-capable"} style= {styles.headerTextInput} clearTextOnFocus onEndEditing= {handleTextInputFinish} onChangeText= {handleTextInputChange} spellCheck= {false} autoCorrect= {false} autoComplete= {"off"} value= {textInputValue} ref= {inputRef} onPress= {handleTextInputPress}/>
                        </BottomSheetView>

                        <TouchableOpacity style= {styles.profileContainer} onPress= {handleProfilePress}>
                            <AvatarComponent/>
                        </TouchableOpacity>

                    </BottomSheetView>

                    {render.render}
                </BottomSheet>

                {
                    profileVisible && (
                        <BottomSheet ref= {profileRef} snapPoints={["30%"]} handleComponent= {null} style= {{borderRadius: 15}}>
                            <BottomSheetView style= {styles.profileSheetContainer}>
                                <BottomSheetView style= {styles.profileSheetHeaderContainer}>
                                    <BottomSheetView style= {styles.profileSheetHeaderImageContainer}>
                                        <Image source= {require("../../assets/avatar.png")} style= {styles.profileSheetHeaderImageContainer}/>
                                    </BottomSheetView>
                                    <BottomSheetView style= {styles.profileSheetHeaderMainContainer}>
                                        <Text style= {{fontSize: 20, fontWeight: "bold"}}>Firstname Lastname</Text>
                                        <Text>somebody@email.com</Text>
                                    </BottomSheetView>
                                    <TouchableOpacity onPress= {handleProfileClose}>
                                        <BottomSheetView style= {styles.profileSheetHeaderCloseContainer}>
                                            <Entypo name= "circle-with-cross" size= {30} color= {"#858585"}/>
                                        </BottomSheetView>
                                    </TouchableOpacity>
                                </BottomSheetView>
                                <BottomSheetView style= {styles.profileSheetContentContainer}>
                                    {/* <ProfileContainerStack.Navigator screenOptions= {{headerShown: false}}>
                                        <ProfileContainerStack.Screen name="main" component= {ProfileMainScreen} />
                                        <ProfileContainerStack.Screen name="library" component= {ProfileLibraryScreen} />
                                        <ProfileContainerStack.Screen name="preference" component= {ProfilePreferenceScreen} />
                                        <ProfileContainerStack.Screen name="logout" component= {ProfileLogoutScreen} />
                                    </ProfileContainerStack.Navigator> */}
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
            <MainContainerStack.Screen name="Main" component= {MainScreen} />
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
        }
    }
)

const carouselStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    content: {
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 20,
        borderWidth: 1,
        borderRadius: 5,
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
        width: ITEM_WIDTH * 0.9,
        height: ITEM_HEIGHT * 0.9,
        justifyContent: "center",
        alignItems: "center",
    }

})