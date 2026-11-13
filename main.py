from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import get_connection
from models import Task

app = FastAPI()

# Frontend directory
FRONTEND_DIR = Path(file).resolve().parent / "frontend"


# Open frontend from the main URL
@app.get("/")
def home():
    return FileResponse(FRONTEND_DIR / "index.html")


# Get all tasks
@app.get("/tasks")
def get_tasks():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM tasks")
    rows = cursor.fetchall()

    conn.close()

    tasks = []

    for row in rows:
        tasks.append({
            "id": row[0],
            "title": row[1],
            "completed": bool(row[2])
        })

    return {"tasks": tasks}


# Add a new task
@app.post("/tasks")
def add_task(task: Task):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO tasks (title) VALUES (?)",
        (task.title,)
    )

    conn.commit()
    conn.close()

    return {"message": "Task added successfully"}


# Delete a task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM tasks WHERE id = ?",
        (task_id,)
    )

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    conn.commit()
    conn.close()

    return {"message": "Task deleted successfully"}


# Update a task
@app.put("/task/{task_number}")
def update_task(task_number: int, task: Task):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE tasks SET title = ? WHERE id = ?",
        (task.title, task_number)
    )

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    conn.commit()
    conn.close()

    return {"message": "Task updated successfully"}


# Toggle task completion
@app.patch("/tasks/{task_id}/complete")
def toggle_task(task_id: int):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE tasks
        SET completed = CASE
            WHEN completed = 0 THEN 1
            ELSE 0
        END
        WHERE id = ?
        """,
        (task_id,)
    )

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    conn.commit()
    conn.close()

    return {"message": "Task status updated successfully"}


# Frontend static files
app.mount(
    "/app",
    StaticFiles(directory=str(FRONTEND_DIR), html=True),
    name="frontend"
)