const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  username: { type: String },
  profilePicture: { type: String },
  authProvider: { type: String, enum: ['local', 'google', 'apple'], default: 'local' },
  providerId: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  dob: { type: Date },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
