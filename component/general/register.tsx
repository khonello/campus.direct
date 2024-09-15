import { View, Text, TextInput, StyleSheet, Dimensions, PixelRatio, TouchableOpacity, TouchableWithoutFeedback, ImageBackground, Button, Alert, Linking, Keyboard, KeyboardAvoidingView } from "react-native";
import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { Image } from "expo-image";
import { Asset } from "expo-asset";
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session"

const WIDTH = Dimensions.get("window").width
const HEIGHT = Dimensions.get("window").height
    
const illustrationAssert = Asset.fromModule(require("../../assets/signup.png"))
const googleAssert = Asset.fromModule(require("../../assets/google.png"))
const loadingAssert = Asset.fromModule(require("../../assets/circle.gif"))
export const Register = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false);
    const redirectUrl = AuthSession.makeRedirectUri({ scheme: "campusnav" });

    const handleSignUpWithGmail = async () => {
         
        setLoading(true)
        const response = await supabase.auth.signInWithOAuth({

            provider: "google",
            options: {
                redirectTo: redirectUrl
            }
        });

        if (response.error) {

            Alert.alert(
                "Login Failed",
                response.error.message || "Invalid email or password. Please try again.",
                [{ text: "OK" }]
            )
        } else {
            // Check user existence and handle signup
            const authSession = await WebBrowser.openAuthSessionAsync(response.data.url, redirectUrl)
            if(authSession.type === "success") {

                //
            }

        }
        setLoading(false)
    };

    const handleSignUpWithPassword = async () => {

        if (email.length > 0 && password.length > 0) {
            setLoading(true)
            const response = await supabase.auth.signUp({
                email: email,
                password: password
            })

            if (response.error) {

                console.log(response.error.message, loading);
                Alert.alert(
                    "Signup Failed",
                    response.error.message || "Invalid email or password. Please try again.",
                    [{ text: "OK" }]
                )
            } else {

                Alert.alert(
                    "Confirm Email",
                    response.error.message || "Confirmation email sent.",
                    [{ text: "OK" }]
                )
            }
            setLoading(false)
            setEmail(""); setPassword("")
        }
    }

    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
    }, [])
    useEffect(() => {
        console.log(session && session.user && session.user.id)
    }, [session])

    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <View style= {styles.container}>
                <View style= {styles.content}>
                    <View style= {styles.topContainer}>
                        <Image source= {illustrationAssert} contentFit= {"cover"} style= {styles.illustrationImage}/>
                    </View>
                    <View style= {styles.bottomContainer}>
                        <View style= {styles.inputContainer}>
                            <TextInput placeholder= {"Email"} style= {styles.textInput} value= {email} onChangeText= {setEmail} clearTextOnFocus keyboardType= {"email-address"}/>
                            <TextInput placeholder= {"Password"} style= {styles.textInput} secureTextEntry clearTextOnFocus value= {password} onChangeText= {setPassword}/>
                        </View>
                        <TouchableOpacity style= {styles.loginButtonContainer} onPress= {handleSignUpWithPassword} disabled= {loading}>
                            {
                                !loading ? (<Text style= {styles.textStyle}>Signup</Text>) : (<Image source= {loadingAssert} style= {{width: loadingAssert.width * 0.5, height: loadingAssert.height * 0.25}}/>)
                            }
                        </TouchableOpacity>
                        <View style= {styles.loginWithContainer}>
                            <View style= {styles.horizontalLine}/>
                            <View style= {styles.loginWithTextContainer}>
                                <Text style= {{fontSize: 12, color: "darkgrey"}}>Or Signup With</Text>
                            </View>
                            <View style= {styles.horizontalLine}/>
                        </View>
                        <TouchableOpacity style= {styles.googleContainer} onPress= {handleSignUpWithGmail}>
                            <Image source= {googleAssert} style= {styles.googleImage}/>
                            <Text style= {{fontWeight: "bold"}}>Google</Text>
                        </TouchableOpacity>
                        <View style= {styles.signupTextContainer}>
                            <Text style= {{color: "darkgrey"}}>You already have an account ?</Text>
                            <TouchableOpacity>
                                <Text style= {{color: "grey", fontWeight: "bold"}}>Signin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
        },
        content: {
            flexDirection: "column"
        },
        topContainer: {
            marginBottom: 70
        },
        bottomContainer: {

        },
        illustrationImage: {
            width: illustrationAssert.width * 0.6,
            height: illustrationAssert.height * 0.5,
        },
        textInput: {
            paddingLeft: 15,
            paddingVertical: 10,
            borderWidth: 1,
            borderRadius: 7,
            borderColor: "grey",
            marginBottom: 20
        },
        inputContainer: {

        },
        loginButtonContainer: {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#6A63F6",
            padding: 10,
            borderRadius: 7,
            marginBottom: 10
        },
        textStyle: {
            fontWeight: "bold",
            color: "white"
        },
        loginWithContainer: {
            flexDirection: "row",
            paddingTop: 10,
            paddingBottom: 3,
            justifyContent: "center",
            alignItems: "center"
        },
        horizontalLine: {
            flex: 0.4,
            height: 1,
            backgroundColor: 'lightgrey',
        },
        loginWithTextContainer: {
            marginHorizontal: 5
        },
        googleContainer: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
        },
        googleImage: {
            width: googleAssert.width * 0.035,
            height: googleAssert.height * 0.035
        },
        signupTextContainer: {
            flexDirection: "row",
            justifyContent: "center",
            paddingTop: 10
        }

    }
)