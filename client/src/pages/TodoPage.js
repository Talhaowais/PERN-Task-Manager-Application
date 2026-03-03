import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import SettingsModal from "../components/SettingsModal";

function TodoPage() {
  const { logout, user, updateUser } = useAuth();

  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [task, setTask] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [error, setError] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editError, setEditError] = useState("");
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [openSettings, setOpenSettings] = useState(false);



  // ================= FETCH DATA =================

  const fetchTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/user");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTodos();
    fetchUsers();
  }, []);

  // ================= SOCKET.IO =================
  // const newSocket = io("http://localhost:5000");
  const socket = io("http://localhost:5000");

  useEffect(() => {
    if (!user?.id) return;
    socket.emit("register_user", user.id);
    // 2. Listen for targeted updates

    socket.on("todo_updated", (updatedTodo) => {
      console.log("updated_todo: ", updateTodo)
      setTodos((prevTodos) => 
        prevTodos.map(t => t.id === updatedTodo.id ? updatedTodo : t)
      );
    });

    socket.on("todo_created", (createTodo) => {
      console.log("todos: ",todos)
      console.log("todo_created: ", createTodo)
      setTodos((prevTodos) =>{
        const tmpTodos = [...prevTodos];
        tmpTodos.push(createTodo);
        return tmpTodos;
      } 
      );
    });

    socket.on("todo_deleted", (deleteTodoId) => {
      console.log("todo_deleted: ", deleteTodoId, typeof(deleteTodoId))
      console.log("todo Id", typeof todos[0].id, )
      console.log("updated Todos: ", todos.filter(t => t.id !== parseInt(deleteTodoId) ))
      setTodos((prevTodos) => 
        prevTodos.filter(t => t.id !== parseInt(deleteTodoId) )
      );
    });
    return () => {
    socket.off("todo_updated");
    socket.off("todo_created");
    socket.off("todo_deleted");
  };
  }, [todos,user?.id]);

  // ================= CRUD =================

  const addTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) return setError("⚠ Task cannot be empty");
    if (!assignedUserId) return setError("⚠ Please assign a user");

    try {
      setLoadingAdd(true);
      setError("");

      await api.post("/todos", {
        task,
        assignedTo: assignedUserId,
        status: "Pending",
      });

      setTask("");
      setAssignedUserId("");
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
    if (!editTask.trim()) return setEditError("⚠ Task cannot be empty");

    try {
      setLoadingUpdate(true);

      await api.put(`/todos/${editingId}`, {
        task: editTask,
      });

      setIsModalOpen(false);
      fetchTodos();
    } finally {
      setLoadingUpdate(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/todos/${id}`, { status: newStatus });
      fetchTodos();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= STATUS STYLE =================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return {
          backgroundColor: "#f0f0f0",
          color: "#555",
          border: "1px solid #ccc",
        };
      case "Started":
        return {
          backgroundColor: "#fff3cd",
          color: "#856404",
          border: "1px solid #ffeeba",
        };
      case "Completed":
        return {
          backgroundColor: "#d4edda",
          color: "#155724",
          border: "1px solid #c3e6cb",
        };
      default:
        return {};
    }
  };

  // ================= UI =================

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.welcomeContainer}>
          <img src={user?.profilePic || "https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico"} alt="Profile" style={styles.profileImage} />
          <h2 style={styles.welcomeText}>Welcome {user?.name} 😊</h2>
        </div>

        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0 }}>✨ My Todo List</h2>
            <p style={styles.userText}>PERN Stack Application</p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              style={styles.settingsBtn}
              onClick={() => setOpenSettings(true)}
            >
              ⚙ Settings
            </button>
            <button style={styles.logoutBtn} onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={addTodo} style={styles.form}>
          <input
            type="text"
            placeholder="Enter task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            style={styles.input}
          />

          <select
            value={assignedUserId}
            onChange={(e) => setAssignedUserId(e.target.value)}
            style={styles.select}
          >
            <option value="">Assign User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <button style={styles.addBtn} disabled={loadingAdd}>
            {loadingAdd ? "Adding..." : "Add"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        {/* Header */}
        <div style={styles.tableHeader}>
          <span style={styles.colHeader}>Task</span>
          <span style={{ ...styles.colHeader, textAlign: "center" }}>
            Status
          </span>
          <span style={styles.colHeader}>Assigned To</span>
          <span style={styles.colHeader}>Created By</span>
          <span style={styles.colHeader}>Updated By</span>
          <span style={{ ...styles.colHeader, textAlign: "right" }}>
            Actions
          </span>
        </div>

        <ul style={styles.list}>
          {todos?.map((todo) => (
            <li key={todo.id} style={styles.todoRow}>
              <span style={styles.colTask} title={todo.task}>
                {todo.task}
              </span>

              <div style={styles.statusColContainer}>
                <select
                  value={todo.status}
                  onChange={(e) =>
                    updateStatus(todo.id, e.target.value)
                  }
                  style={{
                    ...styles.statusSelect,
                    ...getStatusStyle(todo.status),
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Started">Started</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <span style={styles.ellipsis}>
                {todo.assignedUser?.name || "-"}
              </span>
              <span style={styles.ellipsis}>
                {todo.createdByUser?.name || "-"}
              </span>
              <span style={styles.ellipsis}>
                {todo.updatedByUser?.name || "-"}
              </span>

              <div style={styles.actionsContainer}>
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

      {isModalOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Edit Task</h3>
              <span
                style={styles.close}
                onClick={() =>
                  !loadingUpdate && setIsModalOpen(false)
                }
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

      <SettingsModal
        isOpen={openSettings}
        onClose={() => setOpenSettings(false)}
        user={user}
        onSaved={(updatedUser) => updateUser(updatedUser)}
      />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#74ebd5,#ACB6E5)", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "#fff", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "1100px", boxShadow: "0 15px 35px rgba(0,0,0,0.18)" },
  welcomeContainer: { display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", marginBottom: "25px" },
  profileImage: { width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "3px solid #4CAF50" },
  welcomeText: { margin: 0, fontWeight: "600" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  settingsBtn: { background: "#3498db", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" },
  logoutBtn: { background: "#e74c3c", border: "none", color: "#fff", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" },
  form: { display: "flex", gap: "10px", marginBottom: "20px" },
  input: { width: "100%", boxSizing: "border-box", flex: 2, padding: "10px", borderRadius: "8px", border: "1px solid #ddd" },
  select: { flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #ddd", textAlign: "center" },
  addBtn: { background: "#4CAF50", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  
  // Table Layout Logic
  tableHeader: { 
    display: "grid",
    gridTemplateColumns: "1.5fr 140px 1fr 1fr 1fr 100px", 
    marginBottom: "10px",
    padding: "0 12px",
    gap: "15px",
  },
  colHeader: { fontWeight: "bold", color: "#444", fontSize: "14px" },
  
  list: { listStyle: "none", padding: 0, margin: 0 },
  todoRow: { 
    display: "grid",
    gridTemplateColumns: "1.5fr 140px 1fr 1fr 1fr 100px", 
    background: "#f7f9fc",
    marginTop: "8px",
    padding: "12px",
    borderRadius: "10px",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  },
  
  // Alignment helpers
  statusColContainer: { display: "flex", justifyContent: "center", alignItems: "center" },
  statusSelect: { 
    width: "110px", 
    padding: "4px 6px",
    borderRadius: "6px",
    cursor: "pointer",
    textAlign: "center",
    fontSize: "12px",
    height: "30px",
    outline: "none",
    border: "1px solid transparent"
  },
  
  colTask: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500" },
  ellipsis: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px", color: "#666" },
  
  actionsContainer: { display: "flex", justifyContent: "flex-end", gap: "8px" },
  editBtn: { border: "none", background: "#ffc107", padding: "6px 8px", borderRadius: "6px", cursor: "pointer" },
  deleteBtn: { border: "none", background: "#e74c3c", color: "#fff", padding: "6px 8px", borderRadius: "6px", cursor: "pointer" },
  
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.35)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#fff", padding: "25px", borderRadius: "12px", width: "100%", maxWidth: "350px" },
  modalHeader: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  close: { cursor: "pointer" },
  updateBtn: { marginTop: "15px", width: "100%", padding: "10px", border: "none", borderRadius: "8px", background: "#4CAF50", color: "#fff", cursor: "pointer" },
  error: { color: "red", fontSize: "13px", marginTop: "8px" },
};

export default TodoPage;