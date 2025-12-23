/**
 * Items Service
 * Business logic layer for item management
 * Handles database operations via Supabase
 */

import { supabase } from '../db/supabaseClient.js';

// Constants for item status values
const ITEM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
};

/**
 * Creates a new item in the inventory
 * @param {Object} data - Item data from request
 * @param {string} data.name - Item name
 * @param {string} data.code - Item code/SKU
 * @param {number} data.purchase_price - Purchase price
 * @param {string} data.size - Item size
 * @param {string} data.purchase_date - Date of purchase
 * @param {string} data.brought_from - Where item was purchased
 * @returns {Object} The newly created item
 * @throws {Error} If database operation fails
 */
export async function createItem(data) {
  // Build the row object with all item fields
  const row = {
    name: data.name,
    code: data.code,
    purchase_price: data.purchase_price,
    size: data.size,
    purchase_date: data.purchase_date,
    brought_from: data.brought_from,
    status: ITEM_STATUS.AVAILABLE, // Set initial status
  };

  // Insert into Supabase items table
  const { data: insertedItem, error } = await supabase
    .from('items')
    .insert([row])
    .select(); // Return the inserted row

  // Handle database errors
  if (error) {
    throw new Error(`Failed to create item: ${error.message}`);
  }

  // Return the first (and only) inserted item
  return insertedItem[0];
}


export async function deleteItem(itemId) {
  // Converting itemId to number for query
  const id = Number(itemId);

  // Verifying item exists
  const {data: item, error: itemError} = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (itemError || !item) {
    throw new Error('Item not found');
  }

  // If item was sold, delete from sales table first
  if (item.status === ITEM_STATUS.SOLD) {
    const {error: deleteSoldError} = await supabase
      .from('sales')
      .delete()
      .eq('item_id', id);

    if (deleteSoldError) {
      throw new Error(`Failed to delete sale record: ${deleteSoldError.message}`);
    }
  }

  // Delete the item from items table
  const {error: deleteError} = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new Error(`Failed to delete item: ${deleteError.message}`);
  }

  return { id, message: 'Item deleted successfully' };
}

/**
 * Marks an item as sold and creates a sale record
 * @param {string|number} itemId - ID of the item to sell
 * @param {Object} saleData - Sale information
 * @param {number} saleData.sale_price - Price item was sold for
 * @param {string} saleData.sale_date - Date of sale
 * @param {string} saleData.method - Payment method (CASH, BANK, CRYPTO)
 * @param {string} saleData.sold_to - Customer name (optional)
 * @returns {Object} Object containing sale record and updated item
 * @throws {Error} If item not found, already sold, or database operation fails
 */
export async function sellItem(itemId, saleData) {
  // Convert itemId to number for database query
  const id = Number(itemId);

  // Step 1: Verify item exists
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (itemError || !item) {
    throw new Error('Item not found');
  }

  // Step 2: Verify item is not already sold
  if (item.status === ITEM_STATUS.SOLD) {
    throw new Error('Item already sold');
  }

  // Step 3: Create sale record in sales table
  const saleRow = {
    item_id: id,
    sale_price: saleData.sale_price,
    sale_date: saleData.sale_date,
    method: saleData.method,
    sold_to: saleData.sold_to ?? null, // Optional field
  };

  const { data: saleRows, error: saleError } = await supabase
    .from('sales')
    .insert([saleRow])
    .select();

  if (saleError) {
    throw new Error(`Failed to create sale record: ${saleError.message}`);
  }

  const sale = saleRows[0];

  // Step 4: Update item status to SOLD
  const { data: updatedItems, error: updateError } = await supabase
    .from('items')
    .update({ status: ITEM_STATUS.SOLD })
    .eq('id', id)
    .select();

  if (updateError) {
    throw new Error(`Failed to update item status: ${updateError.message}`);
  }

  const updatedItem = updatedItems[0];

  // Step 5: Return both sale record and updated item
  return {
    sale,
    item: updatedItem,
  };
}
/**
 * Retrieves all items from inventory with their sale information
 * @returns {Array} Array of all items with merged sale data, ordered by ID
 * @throws {Error} If database operation fails
 */
export async function getItems() {
  // Step 1: Fetch all items
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('*')
    .order('id', { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to fetch items: ${itemsError.message}`);
  }

  console.log('Raw items from DB:', items); // ADD THIS

  // Step 2: Fetch all sales
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*');

  if (salesError) {
    throw new Error(`Failed to fetch sales: ${salesError.message}`);
  }

  console.log('Raw sales from DB:', sales); // ADD THIS

  // Step 3: Merge sales data into items
  const itemsWithSales = items.map(item => {
    // Find the sale record for this item
    const sale = sales.find(s => s.item_id === item.id);

    console.log(`Item ${item.id}:`, item.name, 'Sale found:', sale); // ADD THIS
    
    // If there's a sale, merge the data
    if (sale) {
      return {
        ...item,
        sold_price: sale.sale_price,
        sold_date: sale.sale_date,
        method: sale.method,
        sold_to: sale.sold_to,
      };
    }
    
    // If no sale, return item as-is
    return item;
  });

  console.log('Final merged items:', itemsWithSales); // ADD THIS

  return itemsWithSales;
}





