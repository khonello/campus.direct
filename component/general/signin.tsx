import { View, Text, TextInput, StyleSheet, Dimensions, PixelRatio, TouchableOpacity, TouchableWithoutFeedback, ImageBackground, Button, Alert, Linking, Keyboard, KeyboardAvoidingView, Modal } from "react-native";
import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Image } from "expo-image";
import { Asset } from "expo-asset";
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import ModalBox from "react-native-modalbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// is the otp input the way it supposed to be, i fill it wrong. what is the best way to go about that
// also even after the otp is submitted, when i check the the supabase dashboard, that particular user object is still unverified.
// and also when i log the value.data within the handleVerifyOtp function, session is null 
const WIDTH = Dimensions.get("window").width
const HEIGHT = Dimensions.get("window").height
    
const illustrationAssert = Asset.fromModule(require("../../assets/signin.png"))
const googleAssert = Asset.fromModule(require("../../assets/google.png"))
const loadingAssert = Asset.fromModule(require("../../assets/circle.gif"))

export const SignInScreen = ({ navigation }) => {

    const insets = useSafeAreaInsets()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [otpVisible, setOtpVisible] = useState(false)

    WebBrowser.maybeCompleteAuthSession()

    const redirectUrl = AuthSession.makeRedirectUri({ preferLocalhost: true })
    const [otp, setOtp] = useState(Array(6).fill(""))
    const [otpColor, setOtpColor] = useState({color: "red"})

    const OTPComponent = ({ show }) => {

        if (show) {
            return (
                <View style={styles.modalContainer}>
                    <View style={{...styles.otpContainer, marginTop: insets.top * 5}}>
                        {otp.map((digit, index) => (
                            <TextInput key={index} placeholder="0" style={{...styles.otpInput, borderColor: otpColor.color}} value={otp[index]} maxLength={1} keyboardType= "numeric" onChangeText={(text) => {

                                    setOtp((prev) => {
                                        const arr = [...prev]
                                        arr[index] = text
                                        return arr
                                    })
                                }}
                            />
                        ))}
                    </View>
                    <View style= {styles.footerButtonsContainer}>
                        <TouchableOpacity onPress={handleVerifyOtp} style= {{...styles.butttonStyle, backgroundColor: "#6A63F6", borderRadius: 5, paddingLeft: 12, paddingRight: 12}}>
                            <Text style= {{color: "white", fontWeight: "bold"}}>Verify</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setOtpVisible(false)} style= {styles.butttonStyle}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    const handleVerifyOtp = () => {

        supabase.auth.verifyOtp({ email: email, token: otp.join(""), type: "signup" })
            .then((value) => {
                console.log(value.data)
                setOtpVisible(false)
            })
            .catch((reason) => {
                setOtpColor(({color: "red"}))
                console.log(reason)
            })
    }

    const handleSignInWithGmail = async () => {
         
        setLoading(true)
        const response = await supabase.auth.signInWithOAuth({

            provider: "google",
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    prompt: "select_account",
                    access_type: "offline"
                }
            }
        })

        if (response.error) {

            Alert.alert(
                "Login Failed",
                response.error.message,
                [{ text: "OK" }]
            )
        } else {
            
            WebBrowser.openAuthSessionAsync(response.data.url, redirectUrl)
                .then((authSession) => {
                    if (authSession.type === "success") {

                        const url = new URL(authSession.url)
                        const params = new URLSearchParams(url.hash.slice(1))

                        supabase.auth.setSession({ access_token: params.get("access_token"), refresh_token: params.get("refresh_token") })
                            .then((value) => {
                                if (value.data.session.user.aud === "authenticated") {
                                    navigation.navigate("main")
                                }
                            })
                    }
                })
                .catch((reason) => {
                    console.log(reason)
                })

        }
        setLoading(false)
    }

    const handleSignInWithPassword = async () => {

        if (email.match(/^\w+@[a-z]{3,}\.[a-z]+$/) && password.length > 0) {
            setLoading(true)

            const response = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })

            if (response.error) {

                if(response.error.code === "email_not_confirmed") {

                    setOtpVisible(true)
                } else {

                    Alert.alert(
                        "Login Failed",
                        response.error.message,
                        [{ text: "OK" }]
                    )
                }
            } else {

                console.log(response.data)
            }
            setLoading(false)
            setEmail(""); setPassword("")
        }
    }

    const handleSignUpClick = () => {

        navigation.navigate("signup")
    }

    useEffect(() => {

        const filtered = otp.filter((digit) => digit !== "")
        if (filtered.length === 6) {
            setOtpColor({color: "green"})
        } else {
            setOtpColor({color: "red"})
        }
    }, [otp])

    return (
        <KeyboardAwareScrollView style={{ flex: 1 }}>
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
                        <TouchableOpacity style= {styles.loginButtonContainer} onPress= {handleSignInWithPassword} disabled= {loading}>
                            {
                                !loading ? (<Text style= {styles.textStyle}>Login</Text>) : (<Image source= {loadingAssert} style= {{width: loadingAssert.width * 0.5, height: loadingAssert.height * 0.25}}/>)
                            }
                        </TouchableOpacity>
                        <View style= {styles.loginWithContainer}>
                            <View style= {styles.horizontalLine}/>
                            <View style= {styles.loginWithTextContainer}>
                                <Text style= {{fontSize: 12, color: "darkgrey"}}>Or Login With</Text>
                            </View>
                            <View style= {styles.horizontalLine}/>
                        </View>
                        <TouchableOpacity style= {styles.googleContainer} onPress= {handleSignInWithGmail}>
                            <Image source= {googleAssert} style= {styles.googleImage}/>
                            <Text style= {{fontWeight: "bold"}}>Google</Text>
                        </TouchableOpacity>
                        <View style= {styles.signupTextContainer}>
                            <Text style= {{color: "darkgrey"}}>You don't have an account ?</Text>
                            <TouchableOpacity onPress= {handleSignUpClick}>
                                <Text style= {{color: "grey", fontWeight: "bold"}}>Signup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <OTPComponent show= {otpVisible}/>
            </View>
        </KeyboardAwareScrollView>
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
            marginTop: 150,
            marginBottom: 70
        },
        bottomContainer: {

        },
        illustrationImage: {
            width: illustrationAssert.width * 0.4,
            height: illustrationAssert.height * 0.4,
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
        },
        modalContainer: {
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            width: WIDTH,
            height: HEIGHT * 2,
        },
        otpContainer: {
            flexDirection: "row",
        },
        otpInput: {
            width: WIDTH * 0.12,
            height: HEIGHT * 0.12,
            paddingLeft: 20,
            borderWidth: 1,
            // borderColor: "red",
            borderRadius: 5,
            marginRight: 10,
        },
        footerButtonsContainer: {
            flexDirection: "row",
            marginTop: 10,
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: WIDTH * 0.2,
            minHeight: 20
        },
        butttonStyle: {
            padding: 7
        }
    }
)
