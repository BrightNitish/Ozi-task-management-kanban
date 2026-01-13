const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
// const { protect } = require('../middlewares/authMiddleware'); // <--- Commented out

// Routes are now OPEN (No login required for testing)
router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;