const express = require("express");
const sequelize = require("./config/database");
const Todo = require("./models/Todo");
const User = require("./models/User");

require("dotenv").config();
const cors = require("cors");
const { Op } = require("sequelize");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.Front_End_Link,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // Listen for a custom event from the frontend to identify the user
  socket.on("register_user", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their private room.`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});



/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.Front_End_Link,
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* ---------------- TODO ROUTES ---------------- */
debugger;
app.post("/api/todos", authMiddleware, async (req, res) => {
  try {
    const { task, assignedTo, status } = req.body;

    const todo = await Todo.create({
      task,
      createdBy: req.userId,
      updatedBy: req.userId,
      assignedTo: assignedTo || null,
      status: status || "Pending",
    });

    const createdTodo = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
        { model: User, as: "updatedByUser", attributes: ["id", "name", "email"] },
        { model: User, as: "assignedUser", attributes: ["id", "name", "email"] },
      ],
    });

        const recipients = new Set([
      createdTodo.createdBy, 
      createdTodo.assignedTo,
    ]);
    console.log("recipients: ", recipients)
    recipients.forEach(userId => {
      if (userId) {
        console.log(userId);
        io.to(`user_${userId}`).emit("todo_created", createdTodo);
      }
    });

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", async (req, res) => {
  res.send("Hello World")
});

app.get("/api/todos", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: {
        [Op.or]: [
          { createdBy: req.userId },
          { assignedTo: req.userId }
        ]
      },
      include: [
        { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
        { model: User, as: "updatedByUser", attributes: ["id", "name", "email"] },
        { model: User, as: "assignedUser", attributes: ["id", "name", "email"] },
      ],
      order: [["id", "ASC"]],
    });

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.put("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const { task, assignedTo, status } = req.body;

    const todo = await Todo.findByPk(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    await todo.update({
      task: task ?? todo.task,
      assignedTo: assignedTo ?? todo.assignedTo,
      status: status ?? todo.status,
      updatedBy: req.userId
    });

    // Fetch fresh data with associations to send via socket
    const updatedTodo = await Todo.findByPk(todo.id, {
      include: [
        { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
        { model: User, as: "updatedByUser", attributes: ["id", "name", "email"] },
        { model: User, as: "assignedUser", attributes: ["id", "name", "email"] },
      ],
    });


    /* --- TARGETED EMIT --- */
    const recipients = new Set([
      updatedTodo.createdBy, 
      updatedTodo.assignedTo,
    ]);
    console.log("recipients: ", recipients)
    recipients.forEach(userId => {
      if (userId) {
        console.log(userId);
        io.to(`user_${userId}`).emit("todo_updated", updatedTodo);
      }
    });
    

    res.json({ message: "Updated successfully", todo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
     const targettedTodo = await Todo.findByPk(req.params.id);
     const recipients = new Set([
      targettedTodo.createdBy, 
      targettedTodo.assignedTo,
    ]);
    const deleted = await Todo.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    
    console.log("recipients: ", recipients)
    recipients.forEach(userId => {
      if (userId) {
        console.log(userId);
        io.to(`user_${userId}`).emit("todo_deleted", req.params.id);
      }
    });

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log("Database synced");
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});