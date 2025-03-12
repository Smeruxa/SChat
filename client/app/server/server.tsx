import { io } from "socket.io-client";

export const socket = io("wss://smeruxa.tw1.ru", {
    path: "/messenger.io",
    transports: ["websocket"],
    secure: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000
});

export default socket