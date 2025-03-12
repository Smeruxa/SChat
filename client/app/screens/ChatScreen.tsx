import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatScreenProps } from "../types";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { socket } from "../server/server";

const DEBUG_WEB = true;

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
    const { name } = route.params;
    const [messages, setMessages] = useState<{ id: string; text: string; isUserMessage: boolean }[]>([]);
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);
    const [inputHeight, setInputHeight] = useState(45);

    useEffect(() => {
        const fetchMessages = async () => {
            const userString = await AsyncStorage.getItem("user");
            if (!userString) return;
            
            const user = JSON.parse(userString);
            socket.emit("get_dialog", {
                username: user.username,
                password: user.password,
                target_user: name
            });
    
            socket.once("dialog_response", (data) => {
                if (data.messages) {
                    setMessages(data.messages.map((msg: any) => ({
                        id: `${msg.timestamp}-${Math.random()}`,
                        text: msg.message,
                        isUserMessage: msg.sender === user.username
                    })));
                }
            });
        };
    
        fetchMessages();
    
        return () => {
            socket.off("dialog_response");
        };
    }, [name]);
    
    useEffect(() => {
        const subscribeToMessages = async () => {
            const userString = await AsyncStorage.getItem("user");
            if (!userString) return;
    
            const user = JSON.parse(userString);
    
            const handleNewMessage = (newMessage: any) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: `${newMessage.timestamp}-${Math.random()}`,
                        text: newMessage.message,
                        isUserMessage: newMessage.sender === user.username
                    }
                ]);
            };
    
            socket.on("new_message", handleNewMessage);
    
            return () => {
                socket.off("new_message", handleNewMessage);
            };
        };
    
        subscribeToMessages();
    }, [name]);

    const scrollDown = () => {
        setTimeout(() => {
            requestAnimationFrame(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            });
        }, 100);
    }

    const sendMessage = async () => {
        if (inputText.trim()) {
            const userString = await AsyncStorage.getItem("user");
            if (userString) {
                const user = JSON.parse(userString);
                socket.emit("add_message", {
                    username: user.username,
                    password: user.password,
                    target_user: name,
                    message: inputText
                });
    
                setInputText("");
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex}
                enabled={!DEBUG_WEB}
            >
                <TouchableWithoutFeedback onPress={DEBUG_WEB ? undefined : Keyboard.dismiss}>
                    <View style={styles.flex}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#fdfdfd" />
                            </TouchableOpacity>
                            <Text style={styles.title}>{name}</Text>
                        </View>

                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={[styles.messageWrapper, item.isUserMessage ? styles.userMessageWrapper : styles.otherMessageWrapper]}>
                                    <Text style={[styles.message, item.isUserMessage ? styles.userMessage : styles.otherUserMessage]}>
                                        {item.text}
                                    </Text>
                                </View>
                            )}
                            contentContainerStyle={styles.messagesContainer}
                            onContentSizeChange={scrollDown}
                            keyboardShouldPersistTaps="always"
                        />

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                placeholder="Введите сообщение..."
                                placeholderTextColor="#aaa"
                                multiline={true}
                            />

                            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                <Ionicons name="paper-plane" size={25} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: "#424242"
    },
    header: {
        backgroundColor: "#2A2A2A",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16
    },
    backButton: {
        marginRight: 10
    },
    title: {
        color: "#fdfdfd",
        fontSize: 20,
        fontWeight: "bold"
    },
    messagesContainer: {
        flexGrow: 1,
        paddingVertical: 12,
        paddingHorizontal: 16
    },
    messageWrapper: {
        flexDirection: "row",
        marginBottom: 8
    },
    userMessageWrapper: {
        justifyContent: "flex-start",
        alignItems: "flex-start"
    },
    otherMessageWrapper: {
        justifyContent: "flex-end",
        alignItems: "flex-end"
    },
    message: {
        padding: 10,
        borderRadius: 8,
        maxWidth: "80%"
    },
    userMessage: {
        backgroundColor: "#6D6D6D",
        color: "#fff",
    },
    otherUserMessage: {
        backgroundColor: "#4E8CFF",
        color: "#fff",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2A2A2A"
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 13,
        alignItems: "center",
        backgroundColor: "#2A2A2A",
        minHeight: 45
    },
    sendButton: {
        width: "15%",
        padding: 13,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center"
    }
});