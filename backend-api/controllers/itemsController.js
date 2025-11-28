import { createItem as createItemService } from '../services/itemsService.js'

export async function createItem(req, res) {
  try {
    // 1. Extract fields
    const { name, code, purchase_price, size, purchase_date, brought_from } = req.body

    // 2. Validate required fields
    if (!name || !purchase_price || !size || !purchase_date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // 3. Build data object
    const data = { name, code, purchase_price, size, purchase_date, brought_from }

    // 4. Call service
    const item = await createItemService(data)

    // 5. Respond with created item
    return res.status(201).json(item)

  } catch (err) {
  console.error("Controller error:", err)
  return res.status(500).json({ error: err.message })
}

}

import { sellItem as sellItemService } from '../services/itemsService.js'

export async function sellItem(req, res) {
  try {
    const id = req.params.id
    const { sale_price, sale_date, method, sold_to } = req.body

    // Basic validation
    if (!sale_price || !sale_date || !method) {
      return res.status(400).json({ error: 'Missing required sale fields' })
    }

    // Call service
    const sale = await sellItemService(id, {
      sale_price,
      sale_date,
      method,
      sold_to
    })

    return res.status(201).json(sale)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}


