const API_URL = "";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const message = document.getElementById("message");
const emptyState = document.getElementById("empty-state");


function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = "message " + type;

    setTimeout(function () {
        message.textContent = "";
        message.className = "message";
    }, 3000);
}


async function loadTasks() {
    try {
        const response = await fetch(API_URL + "/tasks");

        if (!response.ok) {
            throw new Error("Failed to load tasks");
        }

        const data = await response.json();
        const tasks = data.tasks;

        taskList.innerHTML = "";

        const completedTasks = tasks.filter(function (task) {
            return task.completed;
        }).length;

        taskCount.textContent =
            tasks.length + " tasks · " + completedTasks + " completed";

        emptyState.style.display =
            tasks.length === 0 ? "block" : "none";

        tasks.forEach(function (task) {
            createTaskElement(task);
        });

    } catch (error) {
        console.error(error);
        showMessage("Could not load tasks", "error");
    }
}


function createTaskElement(task) {
    const li = document.createElement("li");

    li.className = "task-item " +
        (task.completed ? "completed" : "");

    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.className = "task-checkbox";

    checkbox.addEventListener("change", function () {
        toggleTask(task.id);
    });

    const taskId = document.createElement("span");
    taskId.className = "task-id";
    taskId.textContent = "#" + task.id;

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-button";

    editButton.addEventListener("click", function () {
        startEditing(task, li);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", function () {
        deleteTask(task.id);
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    li.appendChild(checkbox);
    li.appendChild(taskId);
    li.appendChild(title);
    li.appendChild(actions);

    taskList.appendChild(li);
}


taskForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        showMessage("Please enter a task", "error");
        return;
    }

    try {
        const response = await fetch(API_URL + "/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title })
        });

        if (!response.ok) {
            throw new Error("Failed to add task");
        }

        taskInput.value = "";
        showMessage("Task added successfully!");

        await loadTasks();

    } catch (error) {
        console.error(error);
        showMessage("Could not add task", "error");
    }
});


async function deleteTask(taskId) {
    try {
        const response = await fetch(
            API_URL + "/tasks/" + taskId,
            { method: "DELETE" }
        );

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        showMessage("Task deleted successfully!");
        await loadTasks();
        } catch (error) {
        console.error(error);
        showMessage("Could not delete task", "error");
    }
}


async function toggleTask(taskId) {
    try {
        const response = await fetch(
            API_URL + "/tasks/" + taskId + "/complete",
            { method: "PATCH" }
        );

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        await loadTasks();

    } catch (error) {
        console.error(error);
        showMessage("Could not update task", "error");
    }
}


function startEditing(task, li) {
    li.innerHTML = "";

    const input = document.createElement("input");
    input.type = "text";
    input.value = task.title;
    input.className = "edit-input";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "save-button";

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "cancel-button";

    saveButton.addEventListener("click", function () {
        saveTask(task.id, input.value);
    });

    cancelButton.addEventListener("click", function () {
        loadTasks();
    });

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            saveTask(task.id, input.value);
        }

        if (event.key === "Escape") {
            loadTasks();
        }
    });

    li.appendChild(input);
    li.appendChild(saveButton);
    li.appendChild(cancelButton);

    input.focus();
}


async function saveTask(taskId, newTitle) {
    const title = newTitle.trim();

    if (!title) {
        showMessage("Task title cannot be empty", "error");
        return;
    }

    try {
        const response = await fetch(
            API_URL + "/task/" + taskId,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: title })
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        showMessage("Task updated successfully!");
        await loadTasks();

    } catch (error) {
        console.error(error);
        showMessage("Could not update task", "error");
    }
}


const refreshButton = document.getElementById("refresh-button");
refreshButton.addEventListener("click", loadTasks);

loadTasks();