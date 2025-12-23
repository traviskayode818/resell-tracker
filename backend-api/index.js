import 'dotenv/config'
import express from 'express' //To create and API server
import itemsRoutes from './routes/itemsRoutes.js'

// Creating Express APP - to create server instance 
const app = express()
app.use(cors()) 
app.use(express.json()) 

// Mount routes
app.use('/api/items', itemsRoutes)

app.listen(3000, '0.0.0.0', () => {
  console.log('Sever running on port 3000')
});

import cors from 'cors'




