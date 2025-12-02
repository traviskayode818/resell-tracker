import { Router } from 'express'
import { createItem } from '../controllers/itemsController.js'

const router = Router()

// POST /api/items
router.post('/', createItem)

import { sellItem } from '../controllers/itemsController.js'

router.post('/:id/sell', sellItem)

import { getItems } from '../controllers/itemsController.js'

router.get('/', getItems)


export default router
