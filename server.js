require('dotenv').config(); // Load environment variables
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db'); // Import centralized DB connection logic
const userRoutes = require('./routes/UserRoutes');
const topicRoutes = require('./routes/TopicRoutes')
const notificationRoutes = require('./routes/NotificationRoutes')



const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: 'http://127.0.0.1:5500', // Allow your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  })
);
app.use(express.json());


app.use('/api/notifications', notificationRoutes)
app.use('/api/users',userRoutes);
app.use('/api/topics',topicRoutes)



// Start Server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await connectDB(); // Connect to the database
});
