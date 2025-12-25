import { useState } from 'react';
import { API_BASE_URL } from '../config';

function AddItem() {
    const [newItem, setNewItem] = useState ({
        name: '',
        size: '',
        purchase_date: '',
        purchase_price: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    const handleAddItem = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            });
        
        if(!response.ok) {
            throw new Error('Failed to add item');
        }
        const createdItem = await response.json();

        setNewItem({
            name: '',
            size: '',
            purchase_price: '',
            purchase_date:''
        });
        alert("Item added successfully")
        }catch(err) {
            console.error('Error adding items', err);
            alert('Error adding item');
        }finally{
            setLoading(false)
        }
    }


    return (
        <div>
        <h2>Add New Item</h2>
        <div className="add-item-form">
          {/* Item Name Input */}
          <div className="form-row">
            <label>
              Product Name
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
            <button className="add-item-btn" 
            onClick={handleAddItem} 
            disabled={loading}
            >
              {loading ? 'Adding..' : 'Save Item'}
            </button>
          </div>
        </div>
        </div>
    );

}

export default AddItem;
