// routes/userRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");


/* =========================================
   ✅ UPDATE USER SETTINGS (OLD FUNCTIONALITY)
========================================= */
router.put("/settings", authMiddleware, async (req, res) => {
  try {
    const { profileImage, birthDate, pronoun } = req.body;

    await User.update(
      { profileImage, birthDate, pronoun },
      { where: { id: req.userId } }
    );

    const updatedUser = await User.findByPk(req.userId);

    const {
      email,
      birthDate: dob,
      name,
      profileImage: profilePic,
      pronoun: title
    } = updatedUser;

    const localUserData = { email, dob, name, profilePic, title };

    res.json({ user: localUserData });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* =========================================
   ✅ GET ALL USERS (NEW FUNCTIONALITY)
   Used for Assign-To dropdown
========================================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "profileImage"]
    });

    res.json(users);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* =========================================
   ✅ GET SINGLE USER (OPTIONAL FUTURE USE)
========================================= */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "profileImage", "birthDate", "pronoun"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;