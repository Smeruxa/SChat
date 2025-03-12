import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DialogItemProps {
    name: string;
    message: string;
}

export default function DialogItem({ name, message }: DialogItemProps) {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.message} numberOfLines={1}>{message}</Text>
                </View>
                <Ionicons name="ellipsis-horizontal" size={22} color="#B0B0B0" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "#292929",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#3A3A3A"
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    textContainer: {
        flexDirection: "column",
        flex: 1
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF"
    },
    message: {
        fontSize: 14,
        color: "#B0B0B0",
        marginTop: 4
    }
});
