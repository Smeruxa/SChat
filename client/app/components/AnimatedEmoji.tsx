import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";

export default function AnimatedEmoji() {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(withTiming(10, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    return <Animated.Text style={[styles.emoji, animatedStyle]}>😊</Animated.Text>;
}

const styles = StyleSheet.create({
    emoji: {
        fontSize: 30,
        marginLeft: 10
    }
});