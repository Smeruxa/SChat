import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Text, StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DialogItem from "../components/DialogItem";
import { DialogsScreenProps } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { socket } from "../server/server";
import { useFocusEffect } from "@react-navigation/native";

export default function DialogsScreen({ navigation }: DialogsScreenProps) {
    const [dialogs, setDialogs] = useState<any[]>([]);
    const [menuVisible, setMenuVisible] = useState(false);

    const fetchData = async () => {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
            const user = JSON.parse(userString);
            socket.emit("get_dialogs", { username: user.username, password: user.password });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
            
            const interval = setInterval(fetchData, 500);
            const handleDialogsResponse = (response: any) => {
                if (response.status === "error")
                    Alert.alert("Ошибка", response.message);
                else
                    setDialogs(response.dialogs || []);
            };

            socket.on("dialogs_response", handleDialogsResponse);

            return () => {
                clearInterval(interval);
                socket.off("dialogs_response", handleDialogsResponse);
            };
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerWrapper}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                        <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>SChat</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("FindPeople")}>
                        <Ionicons name="search" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {menuVisible && (
                <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuButton} onPress={async () => {
                        await AsyncStorage.removeItem("user");
                        navigation.navigate("Login");
                    }}>
                        <Text style={styles.menuButtonText}>Выйти из аккаунта</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={dialogs}
                keyExtractor={(item) => item.username}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate("Chat", { name: item.username })}>
                        <DialogItem name={item.username} message={item.last_message} />
                    </TouchableOpacity>
                )}
                contentContainerStyle={[styles.list, dialogs.length === 0 && styles.emptyList]}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202020",
    },
    headerWrapper: {
        backgroundColor: "#2A2A2A",
        paddingTop: 15,
        paddingBottom: 15,
        zIndex: 10
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fdfdfd",
    },
    list: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    emptyList: {
        justifyContent: "center",
        alignItems: "center",
    },
    menu: {
        position: "absolute",
        left: 0,
        top: 60,
        width: 200,
        backgroundColor: "#383838",
        padding: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        zIndex: 20
    },
    menuButton: {
        paddingVertical: 12,
        alignItems: "center"
    },
    menuButtonText: {
        color: "#fdfdfd",
        fontSize: 16,
        fontWeight: "bold"
    }
});