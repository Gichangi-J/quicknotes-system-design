
const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const statusMessage = document.getElementById("status");
const notesList = document.getElementById("notes-list");

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // DELETE may return an empty response.
  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const data = await response.json();
  return { data, status: response.status };
}

function showEmptyState() {
  notesList.replaceChildren();
  const item = document.createElement("li");
  item.textContent = "No notes to display yet.";
  notesList.appendChild(item);
}

function renderNote(note) {
  const item = document.createElement("li");
  item.className = "note";

  const heading = document.createElement("h3");
  heading.textContent = note.title || "Untitled note";

  const body = document.createElement("p");
  body.textContent = note.body || "No body provided.";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => deleteNote(note, deleteButton));

  item.append(heading, body, deleteButton);
  item.dataset.noteId = note.id;

  return item;
}

function displayNotes(notes) {
  notesList.replaceChildren();

  if (notes.length === 0) {
    showEmptyState();
    return;
  }

  notes.forEach((note) => notesList.appendChild(renderNote(note)));
}

async function loadNotes() {
  loadButton.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    const { data: notes } = await request(`${API_URL}?_limit=10`);

    displayNotes(notes);
    setStatus(
      notes.length
        ? `Loaded ${notes.length} notes from the server.`
        : "No notes found.",
      "success"
    );
  } catch (error) {
    setStatus("Sorry, we couldn't load your notes. Please try again.", "error");
    console.error("Load notes error:", error);
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Please enter a title.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus("The title must be 100 characters or fewer.", "error");
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const { data: note, status } = await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ title, body, userId: 1 })
    });

    // JSONPlaceholder simulates creation; it does not persist the new note.
    notesList.querySelector('[data-empty="true"]')?.remove();
    const emptyItem = notesList.querySelector("li");
    if (emptyItem && emptyItem.textContent === "No notes to display yet.") {
      emptyItem.remove();
    }

    notesList.prepend(renderNote(note));
    setStatus(`Note created (status ${status}, id ${note.id}).`, "success");
    noteForm.reset();
  } catch (error) {
    setStatus("Sorry, we couldn't create your note. Please try again.", "error");
    console.error("Create note error:", error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(note, deleteButton) {
  deleteButton.disabled = true;
  setStatus("Deleting note...", "loading");

  try {
    const { status } = await request(`${API_URL}/${note.id}`, {
      method: "DELETE"
    });

    // JSONPlaceholder simulates deletion; it does not persist changes.
    const item = deleteButton.closest("li");
    if (item) item.remove();

    if (notesList.children.length === 0) {
      showEmptyState();
    }

    setStatus(`Note deleted (status ${status}).`, "success");
  } catch (error) {
    deleteButton.disabled = false;
    setStatus("Sorry, we couldn't delete that note. Please try again.", "error");
    console.error("Delete note error:", error);
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
