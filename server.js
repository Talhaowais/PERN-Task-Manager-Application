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

/* ✅ CREATE TODO 
   - Keeps old userId logic
   - Adds createdBy
   - Adds assignedTo
*/
app.post("/api/todos", authMiddleware, async (req, res) => {
  try {
    const { task, assignedTo } = req.body;

    const todo = await Todo.create({
      task,
      userId: req.userId,          // 🔥 Old ownership logic
      createdBy: req.userId,       // 🔥 New tracking
      updatedBy: req.userId,       // 🔥 Initial update same as creator
      assignedTo: assignedTo || null
    });

    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* ✅ GET ALL TODOS
   - Show todos created by user
   - OR assigned to user
*/

// Get all todos visible to the logged-in user
app.get("/api/todos", authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.findAll({
      where: {
        [Op.or]: [
          { userId: req.userId },       // Todos created by the user
          { assignedTo: req.userId }    // Todos assigned to the user
        ]
      },
      include: [
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "name", "email"],  // include only what you need
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


/* ✅ GET SINGLE TODO
   - Must be owner OR assigned
*/
app.get("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { userId: req.userId },
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


/* ✅ UPDATE TODO
   - Only owner can update
   - Track updatedBy
*/
app.put("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const { task, assignedTo } = req.body;

    const updated = await Todo.update(
      {
        task,
        assignedTo,
        updatedBy: req.userId   // 🔥 Track updater
      },
      {
        where: {
          id: req.params.id,
          userId: req.userId     // 🔥 Only creator can update
        }
      }
    );

    if (!updated[0]) {
      return res.status(404).json({ message: "Todo not found or unauthorized" });
    }

    res.json({ message: "Updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* ✅ DELETE TODO
   - Only owner can delete
*/
app.delete("/api/todos/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Todo.destroy({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found or unauthorized" });
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