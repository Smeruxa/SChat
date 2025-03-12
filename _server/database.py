import sqlite3

DB_NAME = "users.db"

def execute_query(query, params=(), fetch=False, fetchall=False):
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        if fetch:
            return cursor.fetchone()
        if fetchall:
            return cursor.fetchall()
        conn.commit()
        return True
    
def register_user(username, password):
    existing_user = execute_query("SELECT 1 FROM users WHERE username = ?", (username,), fetch=True)
    if existing_user:
        return False
    return execute_query("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))

def check_login(username, password):
    return execute_query("SELECT 1 FROM users WHERE username = ? AND password = ?", (username, password), fetch=True) is not None

def get_user_id(username):
    result = execute_query("SELECT id FROM users WHERE username = ?", (username,), fetch=True)
    return result[0] if result else None

def get_dialog_id(user1_id, user2_id):
    result = execute_query(
        "SELECT id FROM dialogs WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)", 
        (user1_id, user2_id, user2_id, user1_id), fetch=True
    )
    if result:
        return result[0]
    execute_query("INSERT INTO dialogs (user1_id, user2_id) VALUES (?, ?)", (user1_id, user2_id))
    return get_dialog_id(user1_id, user2_id)

def get_dialogs(username):
    user_id = get_user_id(username)
    if not user_id:
        return []

    result = execute_query("""
        SELECT 
            CASE 
                WHEN d.user1_id = ? THEN u2.username 
                ELSE u1.username 
            END AS interlocutor,
            COALESCE((
                SELECT m.message 
                FROM messages m 
                WHERE m.dialog_id = d.id 
                ORDER BY m.timestamp DESC LIMIT 1
            ), 'Ваш чат пуст..') AS last_message,
            MAX(m.timestamp) AS last_message_timestamp
        FROM dialogs d
        JOIN users u1 ON d.user1_id = u1.id
        JOIN users u2 ON d.user2_id = u2.id
        LEFT JOIN messages m ON m.dialog_id = d.id
        WHERE d.user1_id = ? OR d.user2_id = ?
        GROUP BY d.id
        ORDER BY last_message_timestamp DESC NULLS LAST
    """, (user_id, user_id, user_id), fetchall=True)

    return [{"username": row[0], "last_message": row[1]} for row in result]

def get_dialog(username, target_user):
    user1_id, user2_id = get_user_id(username), get_user_id(target_user)
    if not user1_id or not user2_id:
        return []
    
    dialog_id = get_dialog_id(user1_id, user2_id)
    result = execute_query(
        "SELECT u.username, m.message, m.timestamp FROM messages m "
        "JOIN users u ON m.sender_id = u.id "
        "WHERE m.dialog_id = ? ORDER BY m.timestamp", 
        (dialog_id,), fetchall=True
    )
    return [{"sender": row[0], "message": row[1], "timestamp": row[2]} for row in result]

def add_message(username, target_user, message):
    sender_id, receiver_id = get_user_id(username), get_user_id(target_user)
    if not sender_id or not receiver_id:
        return False
    
    dialog_id = get_dialog_id(sender_id, receiver_id)
    return execute_query(
        "INSERT INTO messages (dialog_id, sender_id, message) VALUES (?, ?, ?)", 
        (dialog_id, sender_id, message)
    )

def get_users_by_part(search_query, current_username):
    result = execute_query("""
        SELECT username
        FROM users
        WHERE username LIKE ? AND username != ?
    """, (f"%{search_query}%", current_username), fetchall=True)
    
    return [{"username": row[0]} for row in result]