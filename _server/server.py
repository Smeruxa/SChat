import json
import sqlite3
import eventlet
import eventlet.wsgi
from flask import Flask, request
from flask_socketio import SocketIO
from database import register_user, check_login, get_user_id, get_dialogs, get_dialog, add_message, get_users_by_part
import datetime

users_sids = {}

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet", path="/messenger.io")
DB_PATH = "users.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS dialogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user1_id INTEGER NOT NULL,
            user2_id INTEGER NOT NULL,
            FOREIGN KEY (user1_id) REFERENCES users (id),
            FOREIGN KEY (user2_id) REFERENCES users (id),
            UNIQUE(user1_id, user2_id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dialog_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dialog_id) REFERENCES dialogs (id),
            FOREIGN KEY (sender_id) REFERENCES users (id)
        );
    """)
    conn.commit()
    conn.close()

def get_user_sid(username):
    return users_sids.get(username)

@socketio.on("disconnect")
def handle_disconnect():
    for username, sid in list(users_sids.items()):
        if sid == request.sid:
            del users_sids[username]
            break

@socketio.on("register")
def handle_register(data):
    username, password = data.get("username"), data.get("password")
    sid = request.sid

    if not username or not password:
        socketio.emit("register_response", {"status": "error", "message": "Неверный логин или пароль"}, room=sid)
        return
    
    response = {"status": "success"} if register_user(username, password) else {"status": "error", "message": "Такой логин уже существует"}
    socketio.emit("register_response", response, room=sid)

@socketio.on("login")
def handle_login(data):
    username, password = data.get("username"), data.get("password")
    sid = request.sid

    if not username or not password or not check_login(username, password):
        socketio.emit("login_response", {"status": "error", "message": "Неверный логин или пароль"}, room=sid)
        return

    users_sids[username] = sid
    socketio.emit("login_response", {"status": "success"}, room=sid)

@socketio.on("get_dialogs")
def handle_get_dialogs(data):
    username, password = data.get("username"), data.get("password")
    sid = request.sid

    if not check_login(username, password):
        socketio.emit("dialogs_response", {"status": "error", "message": "Неверный логин или пароль"}, room=sid)
        return

    dialogs = get_dialogs(username)
    socketio.emit("dialogs_response", {"status": "ok", "dialogs": dialogs}, room=sid)

@socketio.on("get_dialog")
def handle_get_dialog(data):
    username, password, target_user = data.get("username"), data.get("password"), data.get("target_user")
    sid = request.sid

    if not check_login(username, password):
        socketio.emit("dialog_response", {"status": "error", "message": "Неверный логин или пароль"}, room=sid)
        return

    messages = get_dialog(username, target_user)
    socketio.emit("dialog_response", {"status": "ok", "messages": messages}, room=sid)

@socketio.on("add_message")
def handle_add_message(data):
    username, password, target_user, message = data.get("username"), data.get("password"), data.get("target_user"), data.get("message")
    sid = request.sid

    if not check_login(username, password):
        socketio.emit("message_response", {"status": "error", "message": "Неверный логин или пароль"}, room=sid)
        return
    
    success = add_message(username, target_user, message)

    if success:
        new_message = {
            "sender": username,
            "message": message,
            "timestamp": str(datetime.datetime.now())
        }
        socketio.emit("new_message", new_message, room=sid)

        target_sid = get_user_sid(target_user)
        if target_sid:
            socketio.emit("new_message", new_message, room=target_sid)

    socketio.emit("message_response", {"status": "success" if success else "error"}, room=sid)

@socketio.on("get_users_by_part")
def handle_get_users_by_part(data):
    username, password, search_query = data.get("username"), data.get("password"), data.get("search_query")
    sid = request.sid

    if not search_query.strip():
        socketio.emit("users_response", {"status": "error", "message": "Введите никнейм"}, room=sid)
        return

    if not check_login(username, password):
        socketio.emit("users_response", {"status": "error", "message": "Неверный логин или пароль"}, room=sid)
        return

    users = get_users_by_part(search_query, username)
    socketio.emit("users_response", {"status": "ok", "users": users}, room=sid)

if __name__ == "__main__":
    init_db()
    eventlet.wsgi.server(eventlet.listen(("0.0.0.0", 8653)), app)