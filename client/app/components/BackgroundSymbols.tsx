import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function AnimatedBackground() {
    const translate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(translate, {
                toValue: -800,
                duration: 30000,
                useNativeDriver: true,
            })
        ).start();
    }, [translate]);

    return (
        <View style={styles.background}>
            <Animated.View style={[styles.diagonalLines, { transform: [{ translateX: translate }, { translateY: translate }] }]} />
            <Animated.View style={[styles.diagonalLines, { transform: [{ translateX: Animated.add(translate, 800) }, { translateY: Animated.add(translate, 800) }] }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: -1,
    },
    diagonalLines: {
        position: "absolute",
        width: "300%",
        height: "300%",
        backgroundColor: "transparent",
        backgroundImage: `linear-gradient(135deg, rgba(50, 50, 50, 0.2) 25%, transparent 25%, transparent 50%, rgba(50, 50, 50, 0.2) 50%, rgba(50, 50, 50, 0.2) 75%, transparent 75%, transparent)`,
        backgroundSize: "40px 40px",
    },
});