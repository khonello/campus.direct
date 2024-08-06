import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, PixelRatio, TouchableOpacity, ImageBackground, Button } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Image } from "expo-image";
import BottomSheet, { BottomSheetView, BottomSheetTextInput, BottomSheetFlatList, BottomSheetScrollView } from "@gorhom/bottom-sheet";

const WIDTH = Dimensions.get("window").width
const HEIGHT = Dimensions.get("window").height

export const Main = () => {

    useEffect(() => {

        setRender(originalContent)
    }, [])

    const [snapPoints, setSnapPoints] = useState(
        ["12%", "30%", "90%"]
    )
    const [render, setRender] = useState(null)
    const [data, setData] = useState(
        [
            {key: 1, title: "Add", content: <Entypo name= "plus" size= {20} color= {"white"}/>},
            {key: 2, title: "Office", content: <Entypo name= "laptop" size= {20} color= {"white"}/>},
        ]
    )
    const [recentData, setRecentData] = useState(
        Array.from(
            {length: 2},
            (iter, idx) => (
                {key: idx, content: "", icon: ""}
            )
        )
    )
    const [profileVisible, setProfileVisible] = useState(false)

    const mainRef = useRef<BottomSheet>(null)
    const profileRef = useRef<BottomSheet>(null)

    const profileData = [
        {key: 1, icon: <Entypo name= "grid" size= {30} color= {"#858585"}/>, content: "Library", arrow: <Entypo name= "chevron-small-right" size= {20} color= {"#858585"}/>},
        {key: 2, icon: <Entypo name= "info" size= {30} color= {"#858585"}/>, content: "Preference", arrow: <Entypo name= "chevron-small-right" size= {20} color= {"#858585"}/>},
        {key: 3, icon: <Entypo name= "arrow-left" size= {30} color= {"#858585"}/>, content: "Logout", arrow: <Entypo name= "chevron-small-left" size= {20} color= {"#858585"}/>}
    ]

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

    const handleTextInputFinish = () => {
        setRender(originalContent)
    }

    const handleTextInputPress = () => {
        setProfileVisible(false)
        setRender(searchContent)

        profileRef.current?.close()
        mainRef.current?.expand()

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

    const originalContent = (
        <BottomSheetScrollView style= {styles.scrollContainer}>
            <BottomSheetView style= {styles.libraryContainer}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <Text style= {styles.libraryTitleText}>Library</Text>
                </BottomSheetView>
                <BottomSheetScrollView style= {styles.libraryBoxScrollContainer} horizontal>
                    {data.map(libraryRenderItem)}
                </BottomSheetScrollView>
            </BottomSheetView>

            <BottomSheetView style= {styles.recentContainer}>
                <BottomSheetView style= {styles.libraryTitleContainer}>
                    <Text style= {styles.libraryTitleText}>Recent</Text>
                </BottomSheetView>
                <BottomSheetView style= {styles.recentBoxViewContainer}>
                    {recentData.map(recentRenderItem)}
                </BottomSheetView>
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
        null
    )

    return (
        <View style= {styles.container}> 
            <ImageBackground source= {require("../../assets/splash.png")} style= {{width: WIDTH, height: HEIGHT}}>
            <BottomSheet snapPoints= {snapPoints} keyboardBehavior= {"extend"} onChange= {handleMainChange} ref= {mainRef}>

                <BottomSheetView style= {styles.headerContainer}>
                    <BottomSheetView style= {styles.textinputContainer}>
                        <Entypo name= "magnifying-glass" size= {20} color= {"gray"} style= {{ marginRight: 3 }} />
                        <BottomSheetTextInput placeholder= {"Search Maps"} keyboardAppearance= {"default"} keyboardType= {"ascii-capable"} style= {styles.headerTextInput} clearTextOnFocus onTextInput= {handleTextInputPress} onEndEditing= {handleTextInputFinish}/>
                    </BottomSheetView>
                    <TouchableOpacity style= {styles.profileContainer} onPress= {handleProfilePress}>
                        <BottomSheetView>
                            <Image source= {require("../../assets/avatar.png")} style= {styles.headerProfileImage}/>
                        </BottomSheetView>
                    </TouchableOpacity>
                </BottomSheetView>

                {render}
                
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
            </ImageBackground>
        </View>
    )
}


const styles  = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: "center",
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
            minHeight: WIDTH * 0.2,
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