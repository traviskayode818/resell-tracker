/**
 * App Component
 * Main application component for the RMkicks Resell Tracker
 * Provides the layout structure and renders the ItemsList component
 */

import ItemsList from './components/ItemsList';
import './App.css';

import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import './App.css';
import Inventory from './components/Inventory';


function App() {
  return (
    <Router>
     <div className="app-root">
        {/* Centered shell container with max-width */}
      <div className="app-shell">
        {/* Application header with title and description */}
        <header className="app-header">
          <h1>SoleTracker</h1>
          <p>Inventory and sales tracker for RMkicks.</p>
        </header>

        <Navigation/>


        <main className='app-main'>
          <section className='app-card'>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='inventory' element={<Inventory />} />
            </Routes>
          </section>
        </main>
        </div>
        </div>
        </Router>
  );
}

export default App;