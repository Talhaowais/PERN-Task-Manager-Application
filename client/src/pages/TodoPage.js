import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function TodoPage() {
  const { logout, user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [error, setError] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editError, setEditError] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const fetchTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) {
      setError("⚠ Task cannot be empty");
      return;
    }

    try {
      setLoadingAdd(true);
      setError("");
      await api.post("/todos", { task });
      setTask("");
      fetchTodos();
    } finally {
      setLoadingAdd(false);
    }
  };

  const deleteTodo = async (id) => {
    try {
      setLoadingDelete(id);
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } finally {
      setLoadingDelete(null);
    }
  };

  const openModal = (todo) => {
    setEditingId(todo.id);
    setEditTask(todo.task);
    setEditError("");
    setIsModalOpen(true);
  };

  const updateTodo = async () => {
    if (!editTask.trim()) {
      setEditError("⚠ Task cannot be empty");
      return;
    }

    try {
      setLoadingUpdate(true);
      await api.put(`/todos/${editingId}`, { task: editTask });
      setIsModalOpen(false);
      fetchTodos();
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>✨ My Todo List</h2>
            <p style={styles.userText}>
              PERN Stack Application
            </p>
          </div>

          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>

        {/* Add Form */}
        <form onSubmit={addTodo} style={styles.form}>
          <input
            type="text"
            placeholder="Enter task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            style={styles.input}
          />
          <button style={styles.addBtn} disabled={loadingAdd}>
            {loadingAdd ? "Adding..." : "Add"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {/* Todo List */}
        <ul style={styles.list}>
          {todos.map((todo) => (
            <li key={todo.id} style={styles.todoItem}>
              <span>{todo.task}</span>

              <div>
                <button
                  onClick={() => openModal(todo)}
                  style={styles.editBtn}
                >
                  ✏
                </button>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={styles.deleteBtn}
                  disabled={loadingDelete === todo.id}
                >
                  {loadingDelete === todo.id ? "..." : "❌"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Edit Task</h3>
              <span
                style={styles.close}
                onClick={() => !loadingUpdate && setIsModalOpen(false)}
              >
                ✖
              </span>
            </div>

            <input
              type="text"
              value={editTask}
              onChange={(e) => setEditTask(e.target.value)}
              style={styles.input}
            />

            {editError && <p style={styles.error}>{editError}</p>}

            <button
              onClick={updateTodo}
              style={styles.updateBtn}
              disabled={loadingUpdate}
            >
              {loadingUpdate ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#74ebd5,#ACB6E5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.18)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  userText: {
    fontSize: "13px",
    color: "#777",
    margin: "4px 0 0 0",
  },

  logoutBtn: {
    background: "#e74c3c",
    border: "none",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  form: {
    display: "flex",
    gap: "10px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
  },

  addBtn: {
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
  },

  todoItem: {
    background: "#f7f9fc",
    marginTop: "10px",
    padding: "12px 15px",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  editBtn: {
    marginRight: "8px",
    border: "none",
    background: "#ffc107",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  deleteBtn: {
    border: "none",
    background: "#e74c3c",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "350px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
  },

  close: {
    cursor: "pointer",
    fontSize: "18px",
  },

  updateBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    fontSize: "13px",
    marginTop: "8px",
  },
};

export default TodoPage;