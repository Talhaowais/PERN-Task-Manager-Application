const express = require("express");
const sequelize = require("./config/database");
const Todo = require("./models/Todo");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const cookieParser = require("cookie-parser");
const app = express();
const userRoutes = require("./routes/userRoutes");

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.Front_End_Link,
  credentials: true,
}));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* ---------- TODO ROUTES ---------- */

// ✅ Create Todo (User specific)
app.post("/api/todos", authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.create({
      task: req.body.task,
      userId: req.userId   // 🔥 Save logged-in user ID
    });

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get All Todos (Only logged-in user's todos)
app.get("/api/todos", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: { userId: req.userId },   // 🔥 Filter by user
      order: [['id', 'ASC']]
    });

    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Single Todo (Only own)
app.get("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Todo (Only own)
app.put("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Todo.update(
      { task: req.body.task },
      {
        where: {
          id: req.params.id,
          userId: req.userId
        }
      }
    );

    if (!updated[0]) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete Todo (Only own)
app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Todo.destroy({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------- START SERVER ---------- */

const PORT = process.env.PORT || 5000;

// ⚠️ IMPORTANT (Only first time after adding userId)
// Change to force: true once if needed, then change back
sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});