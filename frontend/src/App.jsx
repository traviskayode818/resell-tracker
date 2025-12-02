import ItemsList from './components/ItemsList'
import './App.css'

function App() {
  return (
    <div className = "app">
      <header className = "app-header">
        <h1>Resller Tracker</h1>
        <p>Simple inventory and sales tracker for RMkicks.</p>
     </header>

     <main className = "app.main">
      <section className = "item-section">
        <h2>Items</h2>
        <ItemsList />
      </section>
     </main>
    </div>
  )
}

export default App
