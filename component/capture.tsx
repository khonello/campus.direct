import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native";
import * as Location from 'expo-location';
import * as Sensors from 'expo-sensors';
import ModalBox from "react-native-modalbox";
import Asyncstorage from "@react-native-async-storage/async-storage"

export const Main = () => {

    let item = useRef(null);

    const [textInput, setTextInput] = useState(null);
    const [itemState, setItemState] = useState(false);
    const [showNameModal, setShowEdit] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [capturedData, setCapturedData] = useState([ ]);
    const [tempData, setTempData] = useState(
        {
            name: null, elevation: null, gpsCoord: null, highlighted: false
        }
    );

    useEffect(() => {

        const preload = async () => {

            const data = await Asyncstorage.getItem("data")
            if (data !== null) {

                setCapturedData(JSON.parse(data).captured)
            }
        }
        const getPermissions = async () => {

            let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

            locationStatus !== "granted" && console.log("Permission Denied")
            const interval = setInterval(async () => {

                let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
                setTempData((prevData) => {

                    return {
                        ...prevData,
                        elevation: location.coords.altitude,
                        gpsCoord: [location.coords.latitude, location.coords.longitude],
                    }
                });
            }, 500);

            return () => {

                clearInterval(interval);
            };
        };

        preload()
        getPermissions();
    }, []);

    useEffect(() => {
        
        (async () => {
            await Asyncstorage.setItem("data", JSON.stringify({"captured": capturedData}))  
        })()
    }, [capturedData])

    const renderItem = (item) => {
        return (
            <TouchableOpacity key={item.key} onPress={() => getItem(item.key)}>
                <View style={[styles.scrollable, item.highlighted && styles.highlighted]}>
                    <Text>{ item.name }</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const getItem = (index) => {
        setCapturedData(prevData =>
            prevData.map(item =>
                item.key === index ? { ...item, highlighted: !item.highlighted } : { ...item, highlighted: false }
            )
        );
        const selectedItem = capturedData.find(item => item.key === index);
        if (!selectedItem.highlighted) {
            item.current = selectedItem;
            setItemState(true);
        } else {
            item.current = null;
            setItemState(false);
        }
    };

    const handleShowInfoClick = () => {

        setShowInfo(true)
    }
    const handleCaptureClick = () => {
        setShowConfirm(true);
    };

    const handleEditNameClick = () => {
        setShowEdit(true);
    };

    const handleClearClick = () => {

        setCapturedData([]);
        (async () => {
            await Asyncstorage.setItem("data", JSON.stringify({"captured": []}))
        })()
    }

    const handleEditConfirm = () => {

        const data = capturedData.find((obj) => obj.key === item.current.key)
        data.name = textInput

        setCapturedData((prevData) => (
            [ ...prevData ].filter((obj) => obj.key !== data.key).concat([ data ])
        ))
        
        setTextInput("");
        setShowEdit(false);
    };

    const handleEditCancelled = () => {
        console.log("cancelled");
        setShowEdit(false);
    };

    const handleConfirmConfirmed = () => {

        console.log("capture confirmed");

        const newKey = capturedData.length + 1
        setCapturedData((prevData) => (
            [ ...prevData, { key: newKey, ...tempData, name: `Data #${newKey}`, highlighted: false } ]
        ))
        setShowConfirm(false);
    };

    const handleConfirmCancelled = () => {
        console.log("capture cancelled");
        setShowConfirm(false);
    };

    const handleInfoConfirmed = () => {
        console.log("info confirmed")
        setShowInfo(false)
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.top}>
                    <TouchableOpacity style={{ paddingRight: 10 }} disabled={!itemState} onPress={() => handleShowInfoClick()}>
                        <Text>Show Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleClearClick}>
                        <Text>Clear All</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottom}>
                    <View style={styles.bottomLeft}>
                        <Text>{tempData.elevation === null ? "0" : tempData.elevation}</Text>
                        <Text>{" :: "}</Text>
                        <Text>[ {`${tempData.gpsCoord === null ? "0, -0" : tempData.gpsCoord}`} ]</Text>
                    </View>
                    <View style={{...styles.bottomRight, flex: 0.4, marginRight: 5, minHeight: 100}}>
                        <View style={{...styles.bottomRightTop}}>
                            <ScrollView>
                                {capturedData.map(renderItem)}
                            </ScrollView>
                        </View>
                    </View>
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={{ paddingHorizontal: 5, paddingBottom: 20 }} onPress={handleCaptureClick}>
                        <Text>Capture Point</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ paddingHorizontal: 5, paddingBottom: 20 }} disabled={!itemState} onPress={handleEditNameClick}>
                        <Text>Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ModalBox isOpen={showNameModal} onClosed={() => setShowEdit(false)} style={styles.modalBox}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <TextInput placeholder="New Name" style={styles.input} onChangeText={setTextInput} value={textInput} />
                    <View style={styles.confirmModalButtonsView}>
                        <TouchableOpacity style={{ backgroundColor: '#007AFF', paddingVertical: 5, borderRadius: 5, minWidth: 60, alignItems: "center", marginRight: 5 }} onPress={handleEditConfirm}>
                            <Text style={{ fontSize: 17, color: '#fff' }}>OK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: '#fff', padding: 5, borderRadius: 5, borderColor: '#ccc', borderWidth: 1, }} onPress={handleEditCancelled}>
                            <Text style={{ fontSize: 17, color: '#333' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalBox>
            <ModalBox isOpen={showConfirm} onClosed={() => setShowConfirm(false)} style={styles.confirmModalBox}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 17, color: '#333', marginBottom: 10 }}>Are you sure ?</Text>
                    <View style={styles.confirmModalButtonsView}>
                        <TouchableOpacity style={{ backgroundColor: '#007AFF', paddingVertical: 5, borderRadius: 5, minWidth: 60, alignItems: "center", marginRight: 5 }} onPress={handleConfirmConfirmed}>
                            <Text style={{ fontSize: 17, color: '#fff' }}>OK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: '#fff', padding: 5, borderRadius: 5, borderColor: '#ccc', borderWidth: 1, }} onPress={handleConfirmCancelled}>
                            <Text style={{ fontSize: 17, color: '#333' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalBox>
            <ModalBox isOpen={showInfo} onClosed={() => setShowInfo(false)} style={styles.showinfoModalBox}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style= {{flexDirection: "row"}}>
                        <View style= {{flexDirection: "column", marginRight: 20}}>
                            <Text style={{ fontSize: 17, fontWeight: "bold", color: '#333', marginBottom: 10 }}>Name</Text>
                            <Text style={{ fontSize: 17, fontWeight: "bold", color: '#333', marginBottom: 10 }}>Elevation</Text>
                            <Text style={{ fontSize: 17, fontWeight: "bold", color: '#333', marginBottom: 10 }}>Latitude</Text>
                            <Text style={{ fontSize: 17, fontWeight: "bold", color: '#333', marginBottom: 10 }}>Longitude</Text>
                        </View>
                        <View style= {{flexDirection: "column"}}>
                            <Text style={{ fontSize: 17, color: '#333', marginBottom: 10 }}>{ item.current && item.current.name }</Text>
                            <Text style={{ fontSize: 17, color: '#333', marginBottom: 10 }}>{ item.current && item.current.elevation }</Text>
                            <Text style={{ fontSize: 17, color: '#333', marginBottom: 10 }}>{ item.current && item.current.gpsCoord[0] }</Text>
                            <Text style={{ fontSize: 17, color: '#333', marginBottom: 10 }}>{ item.current && item.current.gpsCoord[1] }</Text>
                        </View>
                    </View>
                    <View style={styles.confirmModalButtonsView}>
                        <TouchableOpacity style={{ backgroundColor: '#007AFF', paddingVertical: 5, borderRadius: 5, minWidth: 250, alignItems: "center", marginRight: 5 }} onPress={handleInfoConfirmed}>
                            <Text style={{ fontSize: 17, color: '#fff' }}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalBox>
        </View>
    );
};

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        content: {
            flex: 0.1,
            justifyContent: "center",
        },
        top: {
            flexDirection: "row",
            paddingLeft: "70%",
            marginBottom: 10,
        },
        topLeft: {

        },
        bottom: {
            flexDirection: "row",
        },
        bottomLeft: {
            flex: 0.57,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            maxHeight: 35,
            paddingRight: 10,
            // backgroundColor: "yellow"
        },
        bottomRight: {
            flex: 0.4,
            flexDirection: "column",
            borderWidth: 1,
            borderRadius: 3,
            minHeight: 63,
            // backgroundColor: "yellow",
        },
        bottomRightTop: {
        
        },
        footer: {
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingTop: 5,
            marginRight: 35,
            // backgroundColor: "red"
        },
        scrollable: {
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            justifyContent: "center",
        },
        highlighted: {
            backgroundColor: "lightgrey",
        },
        modalBox: {
            justifyContent: "center",
            alignItems: "center",
            width: 280,
            height: 120,
            backgroundColor: "#fff",
            borderRadius: 13
        },
        modalView: {
            margin: 20,
            borderRadius: 20,
            padding: 35,
            alignItems: "center",
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            width: 400,
        },
        modalButtonsView: {
            flexDirection: "row"
        },
        input: {
            height: 30,
            backgroundColor: "white",
            borderRadius: 7,
            borderWidth: 1,
            borderColor: "#ccc",
            marginBottom: 10,
            width: 200,
            paddingHorizontal: 10,
            // shadowColor: "#000",
            // shadowOffset: {
            //     width: 0,
            //     height: 2
            // },
            // shadowOpacity: 0.1,
            // shadowRadius: 4,
            // elevation: 1,
        },
        confirmModalBox: {
            width: 280,
            height: 120,
            backgroundColor: "#fff",
            borderRadius: 13, 
            borderColor: "#ccc", 
            borderWidth: 1, 
            padding: 20
        },
        confirmModalButtonsView: {
            flexDirection: 'row',
        },
        showinfoModalBox: {
            width: 300,
            height: 170,
            backgroundColor: "#fff",
            borderRadius: 13, 
            borderColor: "#ccc", 
            borderWidth: 1, 
            padding: 20 
        }
    }
)