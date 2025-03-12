import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { socket } from "./server/server";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "./components/Loading";
import LoginScreen from "./screens/LoginScreen";
import DialogsScreen from "./screens/DialogsScreen";
import ChatScreen from "./screens/ChatScreen";
import FindPeopleScreen from "./screens/FindPeopleScreen";
import RegisterScreen from "./screens/RegisterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootLayout() {
    const [logined, setLogined] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                const user = JSON.parse(userString);

                socket.emit("login", { username: user.username, password: user.password });

                socket.once("login_response", (response) => {
                    setLogined(response.status === "success");
                    setLoading(false);
                });
            } else {
                setLogined(false);
                setLoading(false);
            }
        };
        getUser();
    }, []);

    if (loading) return <Loading />;

    return (
        <Stack.Navigator initialRouteName={logined ? "Dialogs" : "Login"} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dialogs" component={DialogsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="FindPeople" component={FindPeopleScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}
