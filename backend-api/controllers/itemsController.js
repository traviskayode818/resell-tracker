/**
 * Items Controller
 * Handles HTTP requests for item management
 * Acts as middleware between routes and services
 */

import {
  createItem as createItemService,
  sellItem as sellItemService,
  getItems as getItemsService,
  deleteItem as deleteItemService,
} from '../services/itemsService.js';

/**
 * Create a new item in inventory
 * @route POST /items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created item with 201 status
 */
export async function createItem(req, res) {
  try {
    console.log('Incoming Body:', req.body);

    // Extract fields from request body
    const { name, code, purchase_price, size, purchase_date, brought_from } = req.body;

    // Validate required fields
    if (!name || !purchase_price || !size || !purchase_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build data object for service layer
    const data = {
      name,
      code,
      purchase_price,
      size,
      purchase_date,
      brought_from,
    };

    // Call service to create item in database
    const item = await createItemService(data);

    // Respond with created item
    return res.status(201).json(item);
  } catch (err) {
    console.error('Error creating item:', err);
    return res.status(500).json({ error: err.message });
  }
}

export async function deleteItem(req, res) {
  try {
    const id = req.params.id;

    const getRid = await deleteItemService(id);

    return res.status(200).json(getRid);
  }catch(err) {
    console.error ('Error deleting item:', err);
    return res.status(500).json({ error: err.message});
  }
}


/**
 * Mark an item as sold
 * @route POST /items/:id/sell
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated item with sale information
 */
export async function sellItem(req, res) {
  try {
    // Extract item ID from URL parameters
    const id = req.params.id;

    // Extract sale information from request body
    const { sale_price, sale_date, method, sold_to } = req.body;

    // Debug logging for troubleshooting
    console.log('Sell Item Debug:');
    console.log('  - Item ID:', id);
    console.log('  - Raw Body:', req.body);
    console.log('  - Extracted Fields:', {
      sale_price,
      sale_date,
      method,
      sold_to,
    });

    // Validate required fields
    if (!sale_price || !sale_date || !method) {
      console.log('Validation Failed - Missing Fields:', {
        sale_price: !!sale_price,
        sale_date: !!sale_date,
        method: !!method,
      });
      return res.status(400).json({ error: 'Missing required sale fields' });
    }

    // Call service to update item with sale information
    const sale = await sellItemService(id, {
      sale_price,
      sale_date,
      method,
      sold_to,
    });

    console.log('Service Result:', sale);

    // Respond with updated item
    return res.status(201).json(sale);
  } catch (err) {
    console.error('Error selling item:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Retrieve all items from inventory
 * @route GET /items
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of all items
 */
export async function getItems(req, res) {
  try {
    // Fetch all items from service layer
    const items = await getItemsService();

    // Respond with items list
    return res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching items:', err);
    return res.status(500).json({ error: err.message });
  }
}





