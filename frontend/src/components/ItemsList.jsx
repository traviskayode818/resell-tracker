import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';

// Constants for filter types to avoid magic strings
const FILTER_TYPES = {
  ALL: 'ALL',
  IN_STOCK: 'IN_STOCK',
  SOLD: 'SOLD',
};

// Constants for item status values
const ITEM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
};

// Constants for payment methods
const PAYMENT_METHODS = {
  CASH: 'CASH',
  BANK: 'BANK',
  CRYPTO: 'CRYPTO',
};

// Initial state for new item form
const INITIAL_NEW_ITEM_STATE = {
  name: '',
  size: '',
  purchase_price: '',
  purchase_date: '',
};

// Initial state for sell item form
const INITIAL_SELL_FORM_STATE = {
  sold_price: '',
  sold_date: '',
  method: PAYMENT_METHODS.BANK,
};

function ItemsList() {
  // State management for items data and UI
  const [items, setItems] = useState([]); // All items from the database
  const [loading, setLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState(null); // Error state for fetch failures
  const [filter, setFilter] = useState(FILTER_TYPES.ALL); // Current filter selection
  const [showAddForm, setShowAddForm] = useState(false); // Toggle for add item form visibility
  const [newItem, setNewItem] = useState(INITIAL_NEW_ITEM_STATE); // Form data for new item
  const [sellingItemId, setSellingItemId] = useState(null); // ID of item currently being sold
  const [sellForm, setSellForm] = useState(INITIAL_SELL_FORM_STATE); // Form data for selling an item

  // Fetch items from API on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  /**
   * Fetches all items from the API
   * Sets loading, error, and items state accordingly
   */
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      console.log('Fetched items:', data);
      console.log('First item:', data[0]); 
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles adding a new item to inventory
   * Sends POST request to API and updates local state
   */
  const handleAddItem = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const createdItem = await response.json();
      // Add new item to the beginning of the list for immediate visibility
      setItems([createdItem, ...items]);
      // Reset form and hide it
      setNewItem(INITIAL_NEW_ITEM_STATE);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Error adding item');
    }
  };

  /**
   * Initiates the selling process for a specific item
   * Opens the sell form and resets its values
   */
  const startSelling = (id) => {
    setSellingItemId(id);
    setSellForm(INITIAL_SELL_FORM_STATE);
  };

  /**
   * Completes the sale of an item
   * Sends POST request to mark item as sold and updates local state
   */
  const sellItem = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sale_price: sellForm.sold_price,
          sale_date: sellForm.sold_date,
          method: sellForm.method,
          sold_to: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Sell failed:', response.status, data);
        alert(data.error || 'Error marking item as sold');
        return;
      }

      // The API returns { sale, item }, merge sale data into item for display
      const updatedItem = {
        ...data.item,
        sold_price: data.sale.sale_price,
        sold_date: data.sale.sale_date,
        method: data.sale.method,
      };

      // Update the specific item in the list with the merged data
      setItems(items.map((item) => (item.id === id ? updatedItem : item)));
      // Close the sell form
      setSellingItemId(null);
      setSellForm(INITIAL_SELL_FORM_STATE);
    } catch (err) {
      console.error('Error marking item as sold:', err);
      alert('Error marking item as sold');
    }
  };

  const deleteItem = async (id) => {
    if(!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try{
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method : 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      setItems(items.filter((item)  => item.id !== id));
    }catch(err) {
      console.error('Error deleting item:', err);
      alert('Error deleting item');
    }
}

  /**
   * Filters items based on the currently selected filter
   * Returns array of items matching the filter criteria
   */
  const getFilteredItems = () => {
    return items.filter((item) => {
      if (filter === FILTER_TYPES.ALL) return true;
      if (filter === FILTER_TYPES.IN_STOCK) return item.status === ITEM_STATUS.AVAILABLE;
      if (filter === FILTER_TYPES.SOLD) return item.status === ITEM_STATUS.SOLD;
      return true;
    });
  };

  /**
   * Calculates summary statistics for all items
   * Returns object with total items, available, sold, and revenue
   */
  const calculateStats = () => {
    const totalItems = items.length;
    const availableItems = items.filter((item) => item.status === ITEM_STATUS.AVAILABLE).length;
    const soldItems = items.filter((item) => item.status === ITEM_STATUS.SOLD).length;
    const totalRevenue = items.reduce((sum, item) => {
      const price = Number(item.sold_price ?? item.sale_price ?? 0);
      return sum + price;
    }, 0);

    const totalProfit = items.reduce((sum, item) => {
      if (!item.sold_price) return sum;

      const price = Number(item.sold_price);
      const cost = Number(item.purchase_price);
      const profit = price - cost;

      return sum + profit;
    }, 0);

    const totalCost = items.reduce((sum, item) => {
      const cost = Number(item.purchase_price);

      return sum + cost;
    }, 0);

    return { totalItems, availableItems, soldItems, totalRevenue, totalProfit, totalCost};
  };

  /**
   * Calculates profit for a sold item
   * Returns the difference between sold price and purchase price
   */
  const calculateProfit = (item) => {
    return Number(item.sold_price) - Number(item.purchase_price);
  };

  // Loading state - show while fetching data
  if (loading) return <p>Loading items...</p>;
  
  // Error state - show if fetch failed
  if (error) return <p>Error: {error}</p>;
  

 
  // Calculate filtered items and statistics for rendering
  const filteredItems = getFilteredItems();
  const stats = calculateStats();

  return (
    <>
      {/* Summary Statistics Section - displays key metrics */}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">Total items</p>
          <p className="summary-value">{stats.totalItems}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">In stock</p>
          <p className="summary-value">{stats.availableItems}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Sold</p>
          <p className="summary-value">{stats.soldItems}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">Total revenue</p>
          <p className="summary-value">£{stats.totalRevenue}</p>
        </div>
        <div className='summary-card'>
          <p className='summary-label'>Total Profit</p>
          <p className='summary-value'>£{stats.totalProfit}</p>
        </div>
        <div className='summary-card'>
          <p className='summary-label'>Total Amount in stock</p>
          <p className='summary-value'>£{stats.totalCost}</p>
        </div>
      </div>

      {/* Toolbar Section - filters and add button */}
      <div className="items-toolbar">
        {/* Filter buttons to toggle between different views */}
        <div className="filter-bar">
          <button
            className={filter === FILTER_TYPES.ALL ? 'filter-active' : ''}
            onClick={() => setFilter(FILTER_TYPES.ALL)}
          >
            All
          </button>
          <button
            className={filter === FILTER_TYPES.IN_STOCK ? 'filter-active' : ''}
            onClick={() => setFilter(FILTER_TYPES.IN_STOCK)}
          >
            In Stock
          </button>
          <button
            className={filter === FILTER_TYPES.SOLD ? 'filter-active' : ''}
            onClick={() => setFilter(FILTER_TYPES.SOLD)}
          >
            Sold
          </button>
        </div>

        {/* Button to show the add item form */}
        <button className="add-item-btn" onClick={() => setShowAddForm(true)}>
          + Add Item
        </button>
      </div>

      {/* Add Item Form - conditionally rendered */}
      {showAddForm && (
        <div className="add-item-form">
          <h3>Add New Item</h3>
          
          {/* Item Name Input */}
          <div className="form-row">
            <label>
              Name
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. Jordan 4 Thunder"
              />
            </label>
          </div>

          {/* Item Size Input */}
          <div className="form-row">
            <label>
              Size
              <input
                type="text"
                value={newItem.size}
                onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                placeholder="e.g. UK9"
              />
            </label>
          </div>

          {/* Purchase Price Input */}
          <div className="form-row">
            <label>
              Cost (£)
              <input
                type="number"
                value={newItem.purchase_price}
                onChange={(e) => setNewItem({ ...newItem, purchase_price: e.target.value })}
                placeholder="e.g. 120"
              />
            </label>
          </div>

          {/* Purchase Date Input */}
          <div className="form-row">
            <label>
              Date Brought
              <input
                type="date"
                value={newItem.purchase_date}
                onChange={(e) => setNewItem({ ...newItem, purchase_date: e.target.value })}
              />
            </label>
          </div>

          {/* Form Action Buttons */}
          <div className="form-actions">
            <button className="add-item-btn" onClick={handleAddItem}>
              Save Item
            </button>
            <button className="cancel-btn" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items List - displays all filtered items */}
      <div className="items-list">
        {filteredItems.map((item, index) => (
          <div key={item.id || `item-${index}`} className="item-row">
            {/* Item Name and Size */}
            <div className="item-main">
              <span className="item-name">{item.name}</span>
              {item.size && <span className="item-size">({item.size})</span>}
              {item.purchase_date && (
                <span className="item-purchase-date">
                  • {new Date(item.purchase_date).toLocaleDateString()}
                </span>
              )}
              </div>
            {/* Sell Form - shown when user clicks "Sell" button */}
            {sellingItemId === item.id && (
              <div className="sell-form">
                <input
                  type="number"
                  placeholder="Sold price (£)"
                  value={sellForm.sold_price}
                  onChange={(e) => setSellForm({ ...sellForm, sold_price: e.target.value })}
                />
                <input
                  type="date"
                  value={sellForm.sold_date}
                  onChange={(e) => setSellForm({ ...sellForm, sold_date: e.target.value })}
                />
                <select
                  value={sellForm.method}
                  onChange={(e) => setSellForm({ ...sellForm, method: e.target.value })}
                >
                  <option value={PAYMENT_METHODS.CASH}>Cash</option>
                  <option value={PAYMENT_METHODS.BANK}>Bank</option>
                  <option value={PAYMENT_METHODS.CRYPTO}>Crypto</option>
                </select>
                <button className="confirm-sell-btn" onClick={() => sellItem(item.id)}>
                  Confirm
                </button>
              </div>
            )}

            {/* Item Metadata - prices, profit, status, and actions */}
            <div className="item-meta">
              <span className="item-price">Cost: £{item.purchase_price}</span>
              {/* Show sold price and profit only for sold items */}
              {item.sold_price && (
                <>
                  <span className="item-price">Sold: £{item.sold_price}</span>
                  <span className="item-profit">+£{calculateProfit(item)}</span>
                  <span className="item-sold-date">
                    {new Date(item.sold_date).toLocaleDateString()}
                  </span>  {/* ← Fixed: changed </> to </span> */}
                </>
              )}
              {/* Item Status Badge */}
              <span className={`item-status item-status-${item.status?.toLowerCase()}`}>
                {item.status}
              </span>
              <span className='item-delete'>
                <button className='delete-btn' onClick={() => deleteItem(item.id)}>
                  Delete
                </button>
              </span>
              {/* Show "Sell" button only for available items */}
              {item.status === ITEM_STATUS.AVAILABLE && (
                <button className="sell-btn" onClick={() => startSelling(item.id)}>
                  Sell
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ItemsList;