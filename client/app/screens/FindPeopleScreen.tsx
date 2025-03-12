import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FindPeopleScreenProps } from "../types";
import { socket } from "../server/server";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FindPeopleScreen({ navigation }: FindPeopleScreenProps) {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<any[]>([]);

    const handleSearch = async () => {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null && search.trim() !== "") {
            const user = JSON.parse(userString);
            if (user.username && user.password) {
                socket.emit("get_users_by_part", { 
                    username: user.username, 
                    password: user.password, 
                    search_query: search 
                });
                socket.once("users_response", (data: any) => {
                    setUsers(data.users);
                });
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Dialogs")}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Введите никнейм..."
                    placeholderTextColor="#888"
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                    <Ionicons name="search" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.userItem}
                        onPress={() => navigation.navigate("Chat", { name: item.username })}
                    >
                        <Text style={styles.username}>{item.username}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                style={styles.usersList}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#202020",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 10,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        borderRadius: 8,
        paddingHorizontal: 15,
        width: "90%",
        marginTop: 20,
        height: 45,
    },
    backButton: {
        paddingRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#FFFFFF",
        height: "100%",
    },
    searchButton: {
        paddingLeft: 10,
    },
    userItem: {
        padding: 12,
        backgroundColor: "#333",
        marginVertical: 8,
        borderRadius: 8,
        width: "90%",
    },
    username: {
        fontSize: 16,
        color: "#FFF",
    },
    usersList: {
        width: "100%",
        marginTop: 20,
        paddingHorizontal: 15,
    },
});
