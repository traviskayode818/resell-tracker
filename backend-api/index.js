import 'dotenv/config'
import express from 'express' //To create and API server
import itemsRoutes from './routes/itemsRoutes.js'

// Creating Express APP - to create server instance 
const app = express()
app.use(express.json()) 

// Mount routes
app.use('/api/items', itemsRoutes)

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
