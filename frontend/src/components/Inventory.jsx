/**
 * Inventory compenent
 * Displays current inventory with ItemsList
 */

import ItemsList from "./ItemsList";

function Inventory() {
    return (
        <div>
            <h2>Current Inventory</h2>
            <ItemsList />
        </div>
    );
}

export default Inventory;