// backend/src/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], // Enforce specific statuses
    default: 'pending' 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Link task to specific user
    required: true 
  },
}, { timestamps: true }); // Automatically handles created_at