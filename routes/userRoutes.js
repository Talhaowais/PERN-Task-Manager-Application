// userRoutes.js
const express = require("express");
const router = express.Router(); // ✅ define router
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Update user settings
router.put("/settings", authMiddleware, async (req, res) => {
  try {
    const { profileImage, birthDate, pronoun } = req.body;

    await User.update(
      { profileImage, birthDate, pronoun },
      { where: { id: req.userId } }
    );

    const updatedUser = await User.findByPk(req.userId);
    const {email, birthDate: dob, name, profileImage: profilePic, pronoun: title} = updatedUser;
    const localUserData = {email, dob, name, profilePic, title}
    res.json({ user: localUserData });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; //  export router