/**
 * Items Routes
 * Defines API endpoints for item management
 * Base path: /api/items
 */

import { Router } from 'express';
import {
  createItem,
  sellItem,
  getItems,
  deleteItem,
} from '../controllers/itemsController.js';

const router = Router();

/**
 * GET /api/items
 * Retrieve all items from inventory
 */
router.get('/', getItems);

/**
 * POST /api/items
 * Create a new item in inventory
 * Required body fields: name, purchase_price, size, purchase_date
 */
router.post('/', createItem);

/**
 * POST /api/items/:id/sell
 * Mark an item as sold
 * Required body fields: sale_price, sale_date, method
 */
router.post('/:id/sell', sellItem);

router.delete('/:id', deleteItem);

export default router;
