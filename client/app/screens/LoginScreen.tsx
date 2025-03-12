import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginScreenProps } from "../types";
import AnimatedEmoji from "../components/AnimatedEmoji";
import AlertModal from "../components/AlertModal"
import { socket } from "../server/server";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    
    const [visibleError, setVisibleError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async () => {
        socket.off("login_response");
        socket.emit("login", { username: login, password });

        socket.once("login_response", async (response) => {
            if (response.status === "success") {
                await AsyncStorage.setItem("user", JSON.stringify({ username: login, password }));
                navigation.navigate("Dialogs");
            } else {
                setErrorMessage(response.message);
                setVisibleError(true);
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <AlertModal
                visible={visibleError}
                title="Ошибка"
                message={errorMessage}
                buttonText="Закрыть"
                onClose={() => setVisibleError(false)}
            />
            <View style={styles.header}>
                <Text style={styles.welcome}>С <Text style={{ color: "#4E8CFF" }}>возвращением!</Text></Text>
                <AnimatedEmoji />
            </View>
            <View style={styles.authContainer}>
                <Text style={styles.title}>Авторизация</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Логин" 
                    placeholderTextColor="#aaa" 
                    value={login}
                    onChangeText={setLogin}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Пароль" 
                    placeholderTextColor="#aaa" 
                    secureTextEntry 
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Продолжить</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerButton} 
                    onPress={() => {
                        navigation.navigate("Register");
                    }}>
                    <Text style={styles.registerText}>Регистрация</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202020",
        justifyContent: "center",
        paddingHorizontal: 25,
    },
    header: {
        position: "absolute",
        top: 35,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    welcome: {
        color: "#fdfdfd",
        fontSize: 28,
        fontWeight: "bold",
    },
    authContainer: {
        alignItems: "center",
        width: "100%",
    },
    title: {
        color: "#fdfdfd",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#333",
        color: "#fff",
        fontSize: 16,
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
        width: "100%",
    },
    button: {
        backgroundColor: "#505050",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        width: "100%",
        marginTop: 10,
    },
    buttonText: {
        color: "#fdfdfd",
        fontSize: 16,
        fontWeight: "bold",
    },
    registerButton: {
        marginTop: 12,
    },
    registerText: {
        color: "#aaa",
        fontSize: 16,
        fontWeight: "bold",
    },
});