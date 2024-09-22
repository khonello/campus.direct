import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, PixelRatio, TouchableOpacity, TouchableWithoutFeedback, Image, Button, Alert, Linking, Keyboard, KeyboardAvoidingView, TextInput } from "react-native";
import { useFonts } from 'expo-font';
import { supabase } from "../../config/supabase";
import { Asset } from "expo-asset";

const asset = Asset.fromModule(require("../../assets/pathway.png"))
export const LandingScreen = ({ navigation }) => {

    const [loaded, error] = useFonts({
        'Poppins': { uri: require("../../assets/Poppins-BlackItalic.ttf") }
    })

    const Render = ({ loaded }) => {

        if (loaded) {
            return (
                <View style= {styles.content}>
                    <Text style= {styles.textSyle}>CampusDirect</Text>
                    {/* <Image source= {asset} style= {{width: asset.width * 0.7, height: asset.height * 0.7}}/> */}
                </View>
            )
        }
        return (
            null
        )
    }

    useEffect(() => {

        loaded && (
            supabase.auth.onAuthStateChange((event, session) => {
                if (session && session.user.aud === "authenticated") {

                    setTimeout(() => {
                        navigation.navigate("main")
                    }, 2000)
                } else {
                    setTimeout(() => {
                        navigation.navigate("signin")
                    }, 2000)
                }

            })
        )
    }, [loaded])
    return (
        <View style= {styles.container}>
            <Render loaded= {loaded}/>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            backgroundColor: "#6A63F6",
            // justifyContent: "center",
            alignItems: "center",
        },
        content: {

        },
        textSyle: {
            fontFamily: "Poppins",
            fontSize: 36,
            color: "white",
            marginTop: 300
        }
    }
)