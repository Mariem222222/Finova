const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with the hashed password
    const user = new User({ name, email, password: hashedPassword });

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    console.log("User created:", user); // Log the created user
    res.status(201).json({ message: "Utilisateur créé avec succès", token });
  } catch (error) {
    console.error("Error in register function:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login request payload:", req.body); // Log the request payload

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email); // Log if user is not found
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("User found:", user); // Log the user details
    console.log("Plain text password received from frontend:", password); // Log the plain text password
    console.log("Hashed password from database:", user.password); // Log the hashed password

    // Compare the plain text password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isMatch); // Log the comparison result

    if (!isMatch) {
      console.log("Login failed: Incorrect password for user:", email); // Log incorrect password
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("Login successful for user:", email); // Log successful login

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error in login function:", error); // Log the error
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = { register, login };
