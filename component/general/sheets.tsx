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
        ["12%", "55%", "90%"]
    )
    const [render, setRender] = useState(null)
    const [data, setData] = useState(
        [
            {key: 1, title: "Add", content: <Entypo name= "plus" size= {20}/>},
            {key: 2, title: "Office", content: <Entypo name= "laptop" size= {20}/>},
        ]
    )
    const [recentData, setRecentData] = useState(
        Array.from(
            {length: 5},
            (iter, idx) => (
                {key: idx, content: "Book", icon: <Entypo name= "bookmarks" size= {30}/>}
            )
        )
    )
    const [profileVisible, setProfileVisible] = useState(false)

    const mainRef = useRef<BottomSheet>(null)
    const profileRef = useRef<BottomSheet>(null)

    const handleProfilePress = () => {
        
        if (profileVisible) {

            setProfileVisible(false)
            profileRef.current?.close()
        } else  {

            setProfileVisible(true)
            profileRef.current?.expand()
        }

    }

    const handleMainChange = ( index: number ) => {
        if (index == 0) {
            profileRef.current?.close()
        }
    }

    const handleTextInputFinish = () => {
        setRender(originalContent)
    }

    const handleTextInputPress = () => {
        profileRef.current?.close()
        mainRef.current?.expand()
        setRender(searchContent)
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

            <BottomSheetView style= {styles.othersContainer}>
                <BottomSheetView style= {styles.othersBoxIconContainer}>
                    <Entypo name= "direction" size= {30}/>
                </BottomSheetView>
                <BottomSheetView style= {styles.othersBoxTextContainer}>
                    <Text>Share Location</Text>
                </BottomSheetView>
            </BottomSheetView>

            <BottomSheetView style= {styles.othersContainer}>
                <BottomSheetView style= {styles.othersBoxIconContainer}>
                    <Entypo name= "bug" size= {30}/>
                </BottomSheetView>
                <BottomSheetView style= {styles.othersBoxTextContainer}>
                    <Text>Report Issue</Text>
                </BottomSheetView>
            </BottomSheetView>
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
                        <Entypo name= "magnifying-glass" size= {20} color= {"gray"} style= {{ marginRight: 3 }}/>
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
                    <BottomSheet ref= {profileRef} snapPoints={["27%"]} handleComponent= {null} style= {{borderWidth: 1, borderRadius: 10}}>
                        <BottomSheetView>
                            <Text>Second Bottom Sheet</Text>
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
            borderWidth: 1,
            minHeight: WIDTH * 0.25,
        },
        libraryBoxItemsContainer: {
            flexDirection: "column",
            marginRight: 10,
        },
        libraryBoxItemContentContainer: {
            flex: 1,
            marginTop: 10,
            borderRadius: 10,
            borderWidth: 1,
            justifyContent: "center",
            alignItems: "center",
            aspectRatio: 1,
        },
        libraryBoxItemTitleContainer: {
            flex: 0.3,
            alignItems: "center",
            justifyContent: "center"
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
            borderWidth: 1,
            minHeight: WIDTH * 0.2
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
            borderWidth: 1,
            minHeight: WIDTH * 0.1,
            justifyContent: "flex-start",
            alignItems: "center"
        },
        othersBoxIconContainer: {
            borderWidth: 1,
            borderRadius: 7,
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 10

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
    }
)