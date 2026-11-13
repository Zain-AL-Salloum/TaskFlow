import sqlite3


def get_connection():
    conn = sqlite3.connect("tasks.db")
    return conn


def create_table():
    conn = get_connection()
    cursor = conn.cursor()

    # Create tasks table if it doesn't exist
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL
        )
    """)

    # Check if completed column already exists
    cursor.execute("PRAGMA table_info(tasks)")
    columns = cursor.fetchall()

    column_names = [column[1] for column in columns]

    # Add completed column if it doesn't exist
    if "completed" not in column_names:
        cursor.execute("""
            ALTER TABLE tasks
            ADD COLUMN completed INTEGER NOT NULL DEFAULT 0
        """)

    conn.commit()
    conn.close()


create_table()