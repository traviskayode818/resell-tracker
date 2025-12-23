import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';


function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('MONTHLY');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {  
    try {
      const response = await fetch(`${API_BASE_URL}/items`);

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      console.log('Fetched items:', data);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = calculateStats(items, timePeriod);
  console.log('Stats:', stats);  // ← Add this
  console.log('Revenue Change:', stats.revenueChange);  // ← Add this
  console.log('Previous dates:', stats.previousEndDate.getDate());
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>; // ← Added error handling

  return (
    <div>
      <h2>Dashboard</h2>

      {/* Time period buttons */}
      <div className="period-selector">
        <button
          className={timePeriod === 'WEEKLY' ? 'active' : ''}
          onClick={() => setTimePeriod('WEEKLY')}
        >
          Weekly
        </button>
        <button
          className={timePeriod === 'MONTHLY' ? 'active' : ''}
          onClick={() => setTimePeriod('MONTHLY')}
        >
          Monthly
        </button>
        <button
          className={timePeriod === 'QUARTERLY' ? 'active' : ''}
          onClick={() => setTimePeriod('QUARTERLY')}
        >
          Quarterly
        </button>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total Revenue</p>
          <p className="stat-value">£{stats.revenue}</p>
            <p className={`stat-percentage ${stats.revenueChange.direction.toLowerCase()}`}>
              {stats.revenueChange.formattedString} vs last {timePeriod.toLowerCase()}
              </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Profit</p>
          <p className="stat-value">£{stats.profit}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Items Sold</p>
          <p className="stat-value">{stats.sold}</p>
        </div>
         <div className="stat-card">
          <p className="stat-label">Total Cost</p>
          <p className="stat-value">£{stats.cost}</p>
        </div>
        
      </div>

      {/* Chart will go here later */}
    </div>
  );
}

/**
 * Calculate statistics based on time period
 */
function calculateStats(items, period) {
  console.log('Items:', items);
  console.log('Period:', period);
  // Get date range based on period
  const now = new Date();
  let startDate;
  let previousStartDate;
  let previousEndDate;
  

  if (period === 'WEEKLY') {
    // Last 7 days
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'MONTHLY') {
    // Last 30 days
    startDate = new Date();
    startDate.setDate(now.getDate() - 30);
  } else if (period === 'QUARTERLY') {
    // Last 90 days (3 months)
    startDate = new Date();
    startDate.setDate(now.getDate() - 90);
  }

  if (period === 'WEEKLY') {
    previousStartDate = new Date();
    previousStartDate.setDate(now.getDate() - 14);
    previousEndDate = new Date();
    previousEndDate.setDate(now.getDate() - 7);
  } else if (period === 'MONTHLY') {
    previousStartDate = new Date();
    previousStartDate.setDate(now.getDate() - 60);
    previousEndDate = new Date();
    previousEndDate.setDate(now.getDate() - 30);
  }else if (period === 'QUARTERLY') {
  previousStartDate = new Date();
  previousStartDate.setDate(now.getDate() - 180);
  previousEndDate = new Date();
  previousEndDate.setDate(now.getDate() - 90);

  }

 
  

  // Filter items that were sold within the time period
  const soldItems = items.filter(item => {
    if (item.status !== 'SOLD') return false;
    
    // Check if item has a sold_date
    if (!item.sold_date) return false;
    
    // Convert sold_date string to Date object
    const soldDate = new Date(item.sold_date);
    
    // Check if it's within our date range
    return soldDate >= startDate && soldDate <= now;
  });

  const prevSoldItems = items.filter(item => {
    if (item.status != 'SOLD') return false;

    if (!item.sold_date) return false;

    const soldDate = new Date(item.sold_date);

     // ✅ ADD THIS DEBUG LOG
  console.log('Checking item:', item.name, 'sold on:', soldDate, 
                'Is between', previousStartDate, 'and', previousEndDate, '?',
                soldDate >= previousStartDate && soldDate <= previousEndDate);
  

    return soldDate >= previousStartDate && soldDate <= previousEndDate
  });

  console.log('Sold Items:', soldItems);
  console.log('Previous Sold Items:', prevSoldItems);



  // Calculate revenue (total sales)
  const revenue = soldItems.reduce((sum, item) => {
    return sum + Number(item.sold_price || 0);
  }, 0);

  const prevRevenue = prevSoldItems.reduce((sum, item) => {
    return sum + Number(item.sold_price || 0);
  }, 0);



  const revenueChange = (revenue, prevRevenue) => {
    
    if (prevRevenue === 0) {
      return {
        percentageChange : 0,
        direction: 'NEUTRAL',
        formattedString: 'N/A'
      };
    }

    const percentageChange = ((revenue - prevRevenue) / prevRevenue) * 100;
    let direction;
    let formattedString;


    if (percentageChange >= 1) {
      direction = 'UP';
      formattedString = '+' + percentageChange.toFixed(1) + '%';
    }else if (percentageChange <= -1) {
      direction = 'DOWN';
      formattedString = percentageChange.toFixed(1) + '%';
    }else if (percentageChange === 0) {
      direction = 'NEUTRAL';
      formattedString = '0%';
    }

    return {
      percentageChange : percentageChange,
      direction: direction,
      formattedString: formattedString
    };
  };

  const revenueChangeData = revenueChange(revenue, prevRevenue);

  console.log('Revenue Change:', revenueChangeData);

  // Calculate profit (sales - costs)
  const profit = soldItems.reduce((sum, item) => {
    const salePrice = Number(item.sold_price || 0);
    const cost = Number(item.purchase_price || 0);
    return sum + (salePrice - cost);
  }, 0);

  const prevProfit = prevSoldItems.reduce((sum, item) => {
    const salePrice = Number(item.sold_price || 0);
    const cost = Number(item.purchase_price || 0);
    return sum + (salePrice - cost);
  }, 0);

  const profitChange = ((profit - prevProfit) / prevProfit) * 100;

  const cost = soldItems.reduce((sum, item )  => {
    return sum + Number(item.purchase_price)
  }, 0);

  // Count sold items
  const sold = soldItems.length;

  const prevSold = prevSoldItems.length;

  const soldChange = ((sold - prevSold) / prevSold) * 100;

  return {
    revenue: revenue.toFixed(0),
    profit: profit.toFixed(0),
    sold: sold,
    cost: cost,
    revenueChange: revenueChangeData,
    previousEndDate: previousEndDate
  };
}


export default Dashboard;
