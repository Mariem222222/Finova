const express = require("express");
const router = express.Router();
const multer = require("multer"); // Ensure multer is imported
const { updateUserProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get user profile
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put("/:userId", authMiddleware, upload.single("profilePicture"), updateUserProfile);
router.put(
  "/profile", // <-- Simplified endpoint
  authMiddleware,
  upload.single("profilePicture"),
  updateUserProfile
);
module.exports = router;
