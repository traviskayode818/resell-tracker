import { supabase } from '../db/supabaseClient.js'

export async function createItem(data) {
  // 1. Build the row object
  const row = {
    name: data.name,
    code: data.code,
    purchase_price: data.purchase_price,
    size: data.size,
    purchase_date: data.purchase_date,
    brought_from: data.brought_from,
    status: 'AVAILABLE' // optional if DB default exists
  }

  // 2. Insert into Supabase
  const { data: insertedItem, error } = await supabase
    .from('items')
    .insert([row])        // correct spelling
    .select()             // return the row

  // 3. Handle errors
  if (error) {
    throw new Error(error.message)
  }

  // 4. Return inserted row
  return insertedItem[0]
}



export async function sellItem(itemId, saleData) {
  const id = Number(itemId)

  // 1. Check if item exists
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (itemError || !item) {
    throw new Error('Item not found')
  }

  // 2. Check status (must not be SOLD)
  if (item.status === 'SOLD') {
    throw new Error('Item already sold')
  }

  // 3. Insert row into 'sales' table
  const saleRow = {
    item_id: id,
    sale_price: saleData.sale_price,
    sale_date: saleData.sale_date,
    method: saleData.method,
    sold_to: saleData.sold_to ?? null
  }

  const { data: saleRows, error: saleError } = await supabase
    .from('sales')
    .insert([saleRow])
    .select()

  if (saleError) {
    throw new Error(saleError.message)
  }

  const sale = saleRows[0]

  // 4. Update item status to SOLD
  const { data: updatedItems, error: updateError } = await supabase
    .from('items')
    .update({ status: 'SOLD' })
    .eq('id', id)
    .select()

  if (updateError) {
    throw new Error(updateError.message)
  }

  const updatedItem = updatedItems[0]

  // 5. Return sale + updated item
  return {
    sale,
    item: updatedItem
  }
}

export async function getItems() {
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('id', { ascending: true })  // optional but nice

  if (error) {
    throw new Error(error.message)
  }

  return items
}





