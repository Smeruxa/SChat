import { useState } from "react";
import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RegisterScreenProps } from "../types";
import { socket } from "../server/server";
import AlertModal from "../components/AlertModal"

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [visibleError, setVisibleError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = () => {
        if (login.trim() && password.trim() && password === confirmPassword) {
            socket.emit("register", { username: login, password });
            socket.once("register_response", (response) => {
                console.log(response);
                if (response.status === "success")
                    navigation.navigate("Login");
                else {                
                    setErrorMessage(response.message);
                    setVisibleError(true);
                }
            });
        }
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
                <Text style={styles.welcome}><Text style={{ color: "#4E8CFF" }}>Smeruxa</Text> Chat</Text>
            </View>
            <View style={styles.authContainer}>
                <Text style={styles.title}>Регистрация</Text>
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
                <TextInput 
                    style={styles.input} 
                    placeholder="Подтвердите пароль" 
                    placeholderTextColor="#aaa" 
                    secureTextEntry 
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Зарегистрироваться</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.loginText}>Уже есть аккаунт? Войти</Text>
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
    authContainer: {
        alignItems: "center",
        width: "100%",
    },
    title: {
        color: "#fdfdfd",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20
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
        fontWeight: "bold"
    },
    loginButton: {
        marginTop: 12,
    },
    loginText: {
        color: "#aaa",
        fontSize: 16,
        fontWeight: "bold",
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
    }
});
