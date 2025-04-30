const User = require("../models/User");

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phoneNumber, dateOfBirth } = req.body;

    const updateData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
    };

    if (req.file) {
      updateData.profilePicture = req.file.path; // Save the file path to the database
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

module.exports = { updateUserProfile };
