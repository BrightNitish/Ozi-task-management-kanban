const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a text value'],
  },
  tag: {
    type: String,
    // We can make this optional
  },
  status: {
    type: String,
    default: 'todo', // Default to 'todo' column
  }
}, {
  timestamps: true,
});

// CRITICAL: This line exports the model so 'Task.create' works
module.exports = mongoose.model('Task', taskSchema);