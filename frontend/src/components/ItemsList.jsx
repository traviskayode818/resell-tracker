import { useEffect, useState } from 'react'
import { API_BASE_URL } from '../config'


function ItemsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch(`${API_BASE_URL}/items`)
        if (!res.ok) {
          throw new Error('Failed to fetch items')
        }
        const data = await res.json()
        setItems(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  if (loading) return <p>Loading items...</p>
  if (error) return <p>Error: {error}</p>
  if (!items.length) return <p>No items found.</p>

  const filteredItems = items.filter((item) => {
  if (filter === 'ALL') return true
  if (filter === 'IN_STOCK') return item.status === 'IN_STOCK'
  if (filter === 'SOLD') return item.status === 'SOLD'
  return true
})



 return (
  <>
    <div className="items-toolbar">
      <div className="filter-bar">
        <button
          className={filter === 'ALL' ? 'filter-active' : ''}
          onClick={() => setFilter('ALL')}
        >
          All
        </button>

        <button
          className={filter === 'IN_STOCK' ? 'filter-active' : ''}
          onClick={() => setFilter('IN_STOCK')}
        >
          In Stock
        </button>

        <button
          className={filter === 'SOLD' ? 'filter-active' : ''}
          onClick={() => setFilter('SOLD')}
        >
          Sold
        </button>
      </div>

      <button
        className="add-item-btn"
        onClick={() => setShowAddForm(true)}
      >
        + Add Item
      </button>
    </div>

    {showAddForm && (
      <div className="add-item-placeholder">
        {/* We’ll replace this with a real form next step */}
        Add item form will go here.
      </div>
    )}

    <div className="items-list">
      {filteredItems.map((item) => (
        <div className="item-row" key={item.id}>
          <div className="item-main">
            <span className="item-name">{item.name}</span>
            {item.size && <span className="item-size">({item.size})</span>}
          </div>

          <div className="item-meta">
            <span className="item-price">Cost: £{item.purchase_price}</span>
            {item.sold_price && (
              <span className="item-price">Sold: £{item.sold_price}</span>
            )}
            <span
              className={`item-status item-status-${item.status?.toLowerCase()}`}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  </>
)



}

export default ItemsList
