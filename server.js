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

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.Front_End_Link,
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* ---------- TODO ROUTES ---------- */

/* ✅ CREATE TODO */
app.post("/api/todos", authMiddleware, async (req, res) => {
  try {
    const { task, assignedTo, status } = req.body;

    const todo = await Todo.create({
      task,
      createdBy: req.userId,
      updatedBy: req.userId,
      assignedTo: assignedTo || null,
      status: status || "Pending",   // ✅ default status
    });

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* ✅ GET ALL TODOS */
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
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "updatedByUser",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


/* ✅ GET SINGLE TODO */
app.get("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { createdBy: req.userId },
          { assignedTo: req.userId }
        ]
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


/* ✅ UPDATE TODO (NOW SUPPORTS STATUS) */
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
      status: status ?? todo.status,  // ✅ THIS FIXES YOUR ISSUE
      updatedBy: req.userId
    });

    res.json({ message: "Updated successfully", todo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


/* ✅ DELETE TODO */
app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Todo.destroy({
      where: {
        id: req.params.id,
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

sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});