const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicture: { type: String }, // Add profilePicture field
    phoneNumber: { type: String }, // Add phoneNumber field
    dateOfBirth: { type: Date }, // Add dateOfBirth field
});

module.exports = mongoose.model('User', userSchema);
