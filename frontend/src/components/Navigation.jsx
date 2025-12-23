/**
 * Navigation Component
 * Tab-style navigation menu for the app
 */

import { NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="app-nav">
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
        end
      >
        Dashboard
      </NavLink>
      
      <NavLink 
        to="/inventory" 
        className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
      >
        Inventory Management
      </NavLink>
    </nav>
  );
}

export default Navigation;