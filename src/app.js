// src/app.js
const API = "https://to-do-list-with-backend-h9sm.onrender.com/tasks";

const taskList = document.getElementById("taskList");
const taskinput = document.getElementById("taskinput");
const counterElement = document.getElementById("counter");
const progressBarElement = document.getElementById("progressBar");

let tasks = []; // toutes les tâches
let filteredTasks = []; // tâches affichées

// ---------- UTIL ----------
function createTaskElement(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;

  const textSection = document.createElement("div");
  textSection.classList.add("text-section");
  textSection.textContent = task.text;
  if (task.completed) textSection.style.textDecoration = "line-through";

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  const editButton = document.createElement("button");
  editButton.innerHTML = "✏️";
  editButton.addEventListener("click", () => editTask(task));

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = "🗑️";
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  const toggleButton = document.createElement("button");
  toggleButton.innerHTML = task.completed ? "✅" : "🔲";
  toggleButton.addEventListener("click", () => toggleTaskCompleted(task));

  buttonContainer.append(editButton, deleteButton, toggleButton);
  li.append(textSection, buttonContainer);
  return li;
}

function renderTasks() {
  taskList.innerHTML = "";
  filteredTasks.forEach((t) => taskList.appendChild(createTaskElement(t)));
  updateCounter();
}

function updateCounter() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  if (counterElement) {
    counterElement.textContent =
      (done > 0 ? "Bravo, " : "") +
      `tu as réalisé ${done} tâche${done !== 1 ? "s" : ""} sur ${total} !`;
  }
  if (progressBarElement) progressBarElement.style.width = percentage + "%";
}

// ---------- API ----------
async function loadTasks() {
  try {
    const res = await fetch(API);
    tasks = await res.json();
    tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
    filteredTasks = [...tasks];
    renderTasks();
  } catch (err) {
    console.error("Erreur chargement tasks:", err);
  }
}

async function addTask() {
  const text = taskinput.value.trim();
  if (!text) return;
  const newTask = { text, completed: false };
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    const saved = await res.json();
    tasks.push(saved);
    filteredTasks = [...tasks];
    taskinput.value = "";
    renderTasks();
  } catch (err) {
    console.error("Erreur ajout:", err);
  }
}

async function editTask(task) {
  const newText = prompt("Modifier la tâche :", task.text);
  if (newText === null || newText.trim() === "") return;
  try {
    const res = await fetch(`${API}/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim() }),
    });
    const updated = await res.json();
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    filteredTasks = filteredTasks.map((t) =>
      t.id === updated.id ? updated : t
    );
    renderTasks();
  } catch (err) {
    console.error("Erreur édition:", err);
  }
}

async function deleteTask(id) {
  if (!confirm("Supprimer cette tâche ?")) return;
  try {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    tasks = tasks.filter((t) => t.id !== id);
    filteredTasks = filteredTasks.filter((t) => t.id !== id);
    renderTasks();
  } catch (err) {
    console.error("Erreur suppression:", err);
  }
}

async function toggleTaskCompleted(task) {
  try {
    const res = await fetch(`${API}/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    const updated = await res.json();
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    filteredTasks = filteredTasks.map((t) =>
      t.id === updated.id ? updated : t
    );
    renderTasks();
  } catch (err) {
    console.error("Erreur toggle:", err);
  }
}

// ---------- START ----------
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();

  const addButton = document.getElementById("addTaskBtn");
  addButton?.addEventListener("click", addTask);

  const buttonDone = document.getElementById("button_done");
  buttonDone?.addEventListener("click", () => {
    filteredTasks = tasks.filter((t) => !t.completed);
    renderTasks();
  });

  const buttonUndone = document.getElementById("button_undone");
  buttonUndone?.addEventListener("click", () => {
    tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
    filteredTasks = [...tasks];
    renderTasks();
  });

  const buttonAll = document.getElementById("button_all");
  buttonAll?.addEventListener("click", () => {
    filteredTasks = [...tasks]; // copie toutes les tâches pour l'affichage
    renderTasks();
  });

  taskinput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });
});
