import React, { useEffect, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

interface AlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    buttonText?: string;
    onClose: () => void;
}

export default function AlertModal({ visible, title, message, buttonText = "OK", onClose }: AlertModalProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            }).start();

            const timer = setTimeout(() => {
                handleClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => onClose());
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity style={styles.button} onPress={handleClose}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        width: "80%",
        backgroundColor: "#2A2A2A",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 10
    },
    message: {
        fontSize: 16,
        color: "#ddd",
        textAlign: "center",
        marginBottom: 20
    },
    button: {
        backgroundColor: "#4E8CFF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    }
});