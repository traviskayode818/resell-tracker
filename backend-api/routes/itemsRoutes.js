import { Router } from 'express'
import { createItem } from '../controllers/itemsController.js'

const router = Router()

// POST /api/items
router.post('/', createItem)

import { sellItem } from '../controllers/itemsController.js'

router.post('/:id/sell', sellItem)



export default router
