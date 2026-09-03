// backend/user-service/index.js
import express from 'express';
import cors from 'cors';

const app = express();
// Define a unique port for this specific service
const PORT = process.env.PORT || 5001;

// --- MIDDLEWARE ---
app.use(cors());                  // Allows your React frontend to communicate with this service
app.use(express.json());          // Parses incoming JSON request bodies

// --- MOCK DATABASE ---
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];

// --- ROUTES / ENDPOINTS ---

// Health Check Endpoint (Crucial for microservices / orchestrators like Docker/Kubernetes)
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'User Service', status: 'UP', timestamp: new Date() });
});

// Root service endpoint
app.get('/api/users', (req, res) => {
  res.status(200).json(users);
});

// Fetch a single resource
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json(user);
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong inside the User Service!' });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 User Microservice running successfully on port ${PORT}`);
});
