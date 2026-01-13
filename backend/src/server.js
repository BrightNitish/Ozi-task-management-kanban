const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes')
const taskRoutes = require('./routes/taskRoutes');
// Load env vars
dotenv.config();
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes); // <--- 2. Use Routes
app.use('/api/tasks', taskRoutes);
// Test Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});