const Task = require('../models/Task'); // Ensure this path is correct

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public (for now)
const getTasks = async (req, res) => {
  // CHANGED: Removed { user: req.user.id }
  // Now it fetches ALL tasks in the database
  const tasks = await Task.find(); 
  res.status(200).json(tasks);
}

// @desc    Set task
// @route   POST /api/tasks
// @access  Public (for now)
const createTask = async (req, res) => {
  if (!req.body.title) {
    // Check for 'title' because your frontend sends { title: ... }
    // If your frontend sends 'text', change this to req.body.text
    res.status(400);
    throw new Error('Please add a task title');
  }

  const task = await Task.create({
    title: req.body.title, // Matches frontend
    tag: req.body.tag,     // Matches frontend
    status: req.body.status || 'todo',
    // CHANGED: Removed 'user: req.user.id'
  });

  res.status(200).json(task);
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Public (for now)
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(400);
    throw new Error('Task not found');
  }

  // CHANGED: Removed the check for matching user ID
  
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTask);
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public (for now)
// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(400);
    throw new Error('Task not found');
  }

  // USE THIS METHOD instead of task.remove()
  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id });
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
}