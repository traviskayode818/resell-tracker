import 'dotenv/config'
import express from 'express'
import cors from 'cors'  // ✅ Move this to the top!
import itemsRoutes from './routes/itemsRoutes.js'

// Creating Express APP - to create server instance 
const app = express()
app.use(cors()) 
app.use(express.json()) 

// Mount routes
app.use('/api/items', itemsRoutes)

// Add a root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Resell Tracker API is running!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
});


