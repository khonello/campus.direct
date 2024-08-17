import { View, Text, StyleSheet, Dimensions, PixelRatio, TouchableOpacity, ImageBackground, Button, Alert, Linking } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, Circle } from 'react-native-maps';
import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import BottomSheet, { BottomSheetView, BottomSheetTextInput, BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import Constants from "expo-constants";
import debounce from "lodash.debounce";
import * as Location from "expo-location";

const WIDTH = Dimensions.get("window").width
const HEIGHT = Dimensions.get("window").height
const names = {}
const facilities = {}

export const Main = () => {

    const insets = useRef(useSafeAreaInsets())
    const googleMapsURL = "https://maps.googleapis.com/maps/api/"
    const googleMapsAPIkey = Constants.manifest2.extra.expoClient.extra.googleMapsApiKey
    const campus = [
        { id: 1, names: ["foe", "faculty of engineering", "engineering block"], facilities: ["washrooms", "offices", "labs"], officialName: "Faculty Of Engineering", placeID: "ChIJ-f_vcYFq3w8RB-jHZuqSA0Q" },
        { id: 2, names: ["fbne", "faculty of built and natural environment"], facilities: ["offices", "hall"], officialName: "Faculty of Built and Natural Environment", placeID: "ChIJjRNljXdr3w8RmfE2dCRNU5I" },
        { id: 3, names: ["ccb", "central classroom block"], facilities: ["library", "offices"], officialName: "Central Classroom Block", placeID: "ChIJTRlU9IBq3w8RJBZ1hdU3eQQ" },
        { id: 4, names: ["as", "applied science"], facilities: ["offices", "hall"], officialName: "Applied Science", placeID: "ChIJvffQqIFq3w8RS9zAMHcllvA" },
        { id: 5, names: ["getfund"], facilities: ["supermarket"], officialName: "GetFund", placeID: "ChIJYdqTyIZq3w8RQBZzxr_cN2s" },
        { id: 6, names: ["tennis"], facilities: ["court"], officialName: "Tennis", placeID: "ChIJUzNi3vBr3w8R2ZBtUl0JYIo" },
        { id: 7, names: ["basket ball"], facilities: ["court"], officialName: "Basket Ball", placeID: "ChIJb9Uaq4Fq3w8RWMMfJx3oHgI" },
        { id: 8, names: ["adb", "agriculture development bank", "atm"], facilities: [], officialName: "Agriculture Development Bank ATM", placeID: "ChIJHUgeNzVA3w8RhtgdHTd9DX8" },
        { id: 9, names: ["gcb", "ghana commercial bank", "atm"], facilities: [], officialName: "Ghana Commercial Bank ATM", placeID: "ChIJV7-LHshr3w8Re6XgDWGQ5F0" },
        { id: 10, names: ["radio"], facilities: [], officialName: "Radio 87.7Mhz", placeID: "ChIJx_fIG4Fq3w8R50I78KKrX6Y" },
        { id: 11, names: ["mosque"], facilities: [], officialName: "Central Mosque", placeID: "ChIJA5Bdpltr3w8RthAWfIzH2iI" },
        { id: 12, names: ["bm", "business management"], facilities: [], officialName: "Business Management Block", placeID: "ChIJUeMjxxtr3w8RdoxeLH3oXm4" },
        { id: 13, names: ["ad"], facilities: [], officialName: "AD Block ( Old Administration Block )", placeID: "ChIJVdBtEIFq3w8RrqQRORv2e5M" },
        { id: 14, names: ["fhas", "faculty of health and allied science"], facilities: [], officialName: "Faculty of Health and Allied Science", placeID: "ChIJs7TEQwBr3w8RgcqYXb0sLcA" },
        { id: 15, names: ["fbms", "faculty of business and management studies"], facilities: [], officialName: "Faculty of Business and Management Studies", placeID: "ChIJIejocABr3w8RzW3tHkyur0w" },
    ]
    const [snapPoints, setSnapPoints] = useState(
        ["12%", "30%", "90%"]
    )
    const [render, setRender] = useState({which: "original", render: null}) 
    const [data, setData] = useState(
        [
            {key: 1, title: "Office", content: <Entypo name= "laptop" size= {20} color= {"white"}/>},
            {key: 2, title: "Washroom", content: <Entypo name= "water" size= {20} color= {"white"}/>},
        ]
    )
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
        [

        ]
    )
    
    const [profileVisible, setProfileVisible] = useState(false)

    const mainRef = useRef<BottomSheet>(null)
    const profileRef = useRef<BottomSheet>(null)

    const profileData = [
        {key: 1, icon: <Entypo name= "grid" size= {30} color= {"#858585"}/>, content: "Library", arrow: <Entypo name= "chevron-small-right" size= {20} color= {"#858585"}/>},
        {key: 2, icon: <Entypo name= "info" size= {30} color= {"#858585"}/>, content: "Preference", arrow: <Entypo name= "chevron-small-right" size= {20} color= {"#858585"}/>},
        {key: 3, icon: <Entypo name= "arrow-left" size= {30} color= {"#858585"}/>, content: "Logout", arrow: <Entypo name= "chevron-small-left" size= {20} color= {"#858585"}/>}
    ]

    const debouncedSearch = useMemo(
        () => debounce((text) => performSearch(text), 1000),
    [])

    const handleProfilePress = () => {
        
        if (profileVisible) {

            setProfileVisible(false)
            profileRef.current?.close()

        } else  {

            setProfileVisible(true)
            profileRef.current?.expand()
            mainRef.current?.snapToIndex(1)
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

        const lowerCase = text.toLowerCase().trim()
        
        profileRef.current?.close()
        mainRef.current?.expand()

        lowerCase.startsWith("ktu") && lowerCase.replace("ktu", "").trim()

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

                if (key.startsWith(lowerCase.trim())) {

                    const infrastructureID: number = names[key] || facilities[key]
                    if (infrastructureID) {
                        
                        if (Array.isArray(infrastructureID)) {
                            infrastructureID.forEach(id => {

                                IDsKey.add({ id: id, key: key })
                            });
                        } else {

                            IDsKey.add({ id: infrastructureID, key: null })
                        }
                    }
                }
            })
            IDsKey.forEach((IDkey) => {

                const infrastructure = campus.find((item) => item.id == IDkey.id)
                setRecentData((prevData) => (
                    [ ...prevData.filter((obj) => obj.key !== IDkey.id), {key: IDkey.id, content: `${infrastructure.officialName}${IDkey.key ? `, ${IDkey.key}` : ""}`, icon: ""} ]
                ))

                searches.add(JSON.stringify({key: IDkey.id, content: `${infrastructure.officialName}${IDkey.key ? `, ${IDkey.key}` : ""}`, icon: ""}))
            })

            searches.forEach((data: string) => {
                setSearchData((prevData) => (
                    [...prevData, JSON.parse(data)]
                ))
            })

        }
    }

    const handleTextInputFinish = () => {
        // setRender(originalContent)
        setRender({which: "original", render: originalContent})
    }

    const handleTextInputChange = ( text: string ) => {

        setProfileVisible(false)
        setSearchData([])

        debouncedSearch(text)
    }


    const libraryRenderItem = ( item ) => (

        <BottomSheetView style= {styles.libraryBoxItemsContainer} key= {item.key.toString()}>
            <TouchableOpacity style= {{flex: 1}}>
                <BottomSheetView style= {styles.libraryBoxItemContentContainer}>
                    <Text>{item.content}</Text>
                </BottomSheetView>
                <BottomSheetView style= {styles.libraryBoxItemTitleContainer}>
                    <Text>{item.title}</Text>
                </BottomSheetView>
            </TouchableOpacity>
        </BottomSheetView>
    )

    const recentRenderItem = ( item ) => (
        <BottomSheetView style= {styles.recentItemContainer} key= {item.key}>
            <TouchableOpacity>
                <BottomSheetView style= {{flexDirection: "row"}}>
                    {item.icon}
                    <Text style= {{paddingLeft: 10, paddingTop: 5}}>{item.content}</Text>
                </BottomSheetView>
            </TouchableOpacity>
        </BottomSheetView>
    )

    const profileRenderItem = ( item ) => (
        <BottomSheetView style= {styles.recentItemContainer} key= {item.key}>
            <TouchableOpacity>
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

    const RecentComponent = ( { content } ) => (
        <BottomSheetView style= {styles.recentBoxViewContainer}>
            {content.map(recentRenderItem)}
        </BottomSheetView>
    )

    const LibraryComponent = ( { content } ) => (
        <BottomSheetScrollView style= {styles.libraryBoxScrollContainer} horizontal>
            {content.map(libraryRenderItem)}
        </BottomSheetScrollView>
    )

    const SearchComponent = ( { content } ) => (
        <BottomSheetView style= {styles.recentBoxViewContainer}>
            {content.map(recentRenderItem)}
        </BottomSheetView>
    )

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

            (async () => {
                
                const info = await Location.getCurrentPositionAsync()
                // console.log(info.coords)
            })()
        })()
        setRender({which: "original", render: originalContent})
    }, [])

    useEffect(() => {

        const buildRelation = () => {
            campus.forEach((block) => {
                block.names.forEach((name) => {
                    names[name] = block.id
                }) 
                block.facilities.forEach((facility) => {
                    const check = facilities[facility] || []
                    facilities[facility] = [...check, block.id]
                })
            })

        }

        buildRelation()
    }, [])


    useEffect(() => {

        setRender(render.which === "search" ? {which: "search", render: searchContent} : {which: "original", render: originalContent})
    }, [searchData])

    const originalContent = (
        <BottomSheetScrollView style= {styles.scrollContainer}>
            <BottomSheetView style= {styles.libraryContainer}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <Text style= {styles.libraryTitleText}>Library</Text>
                </BottomSheetView>
                <LibraryComponent content= {data}/>
            </BottomSheetView>

            <BottomSheetView style= {styles.recentContainer}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <BottomSheetView style= {{flexDirection: "row", justifyContent: "space-between"}}>
                        <Text style= {styles.libraryTitleText}>Recent</Text>
                        <TouchableOpacity onPress= {() => setRecentData([])}>
                            <Text style= {{...styles.libraryTitleText, paddingRight: 10}}>Clear</Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheetView>
                <RecentComponent content= {recentData}/>
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

            <BottomSheetView style= {{...styles.recentContainer, marginTop: 0}}>
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
                <MapView style= {{flex: 1}} initialRegion= {{latitude: 6.0645664, longitude: -0.2653885, latitudeDelta: 0.0922, longitudeDelta: 0.0421}}>
                    <Marker coordinate= {{latitude: 6.0645664, longitude: -0.2653885}} title= "Hell" description= "Welcome To Hell"/>
                </MapView>
                <BottomSheet snapPoints= {snapPoints} keyboardBehavior= {"extend"} onChange= {handleMainChange} ref= {mainRef}>

                    <BottomSheetView style= {styles.headerContainer}>
                        <BottomSheetView style= {styles.textinputContainer}>
                            <Entypo name= "magnifying-glass" size= {20} color= {"gray"} style= {{ marginRight: 3 }} />
                            <BottomSheetTextInput placeholder= {"Search Maps"} keyboardAppearance= {"default"} keyboardType= {"ascii-capable"} style= {styles.headerTextInput} clearTextOnFocus onEndEditing= {handleTextInputFinish} onChangeText= {handleTextInputChange} spellCheck= {false} autoCorrect= {false} autoComplete= {"off"} onTouchStart= {() => setRender({which: "search", render: searchContent })}/>
                        </BottomSheetView>
                        <TouchableOpacity style= {styles.profileContainer} onPress= {handleProfilePress}>
                            <BottomSheetView>
                                <Image source= {require("../../assets/avatar.png")} style= {styles.headerProfileImage}/>
                            </BottomSheetView>
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


const styles  = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: "center",
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
            minHeight: HEIGHT * 0.11,
            backgroundColor: "#E7E7E6",

        },
        recentContainer: {
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
        }
    }
)