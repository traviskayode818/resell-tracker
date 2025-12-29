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
import AddItem from './components/AddItem';
import logo from './assets/logo.png';



function App() {
  return (
    <Router>
     <div className="app-root">
        {/* Centered shell container with max-width */}
      <div className="app-shell">
        {/* Application header with title and description */}
        <header className="app-header">
          <img src={logo} alt="Sole Tracker" className='app-logo' />
          <p>Know your stock. Track every sale. </p>
        </header>

        <Navigation/>


        <main className='app-main'>
          <section className='app-card'>
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='inventory' element={<Inventory />} />
              <Route path='add-item' element={<AddItem/>} />
            </Routes>
          </section>
        </main>
        </div>
        </div>
        </Router>
  );
}

export default App;