import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import {
  LineChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  AreaChart
} from 'recharts';


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
  const chartData = prepareChartData(items);
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
          <p className='stat-label-emoji'>💷</p>
          <p className="stat-label">Total Revenue</p>
          <p className="stat-value">£{stats.revenue}</p>
            <p className={`stat-percentage ${stats.revenueChange.direction.toLowerCase()}`}>
              {stats.revenueChange.formattedString} vs last {timePeriod.toLowerCase()}
              </p>
        </div>
        <div className="stat-card">
          <p className='stat-label-emoji'>📈</p>
          <p className="stat-label">Total Profit</p>
          <p className="stat-value">£{stats.profit}</p>
          <p className={`stat-percentage ${stats.profitChange.direction.toLowerCase()}`}>
            {stats.profitChange.formattedString} vs last {timePeriod.toLowerCase()}
          </p>
        </div>
        <div className="stat-card">
          <p className='stat-label-emoji'>📦</p>
          <p className="stat-label">Items Sold</p>
          <p className="stat-value">{stats.sold}</p>
          <p className={`stat-percentage ${stats.amountSoldChange.direction.toLowerCase()}`}>
            {stats.amountSoldChange.formattedString} vs last {timePeriod.toLowerCase()}
          </p>
        </div>        
      </div>
      <div className='chart-container'>
        <h3>Profit & Revenue Trends</h3>
        <div style={{overflowX: 'auto'}}>
        <div style={{minWidth: '600px'}}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
            {/* Revenue gradient - bright cyan */}
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
              </linearGradient>
        
            {/* Profit gradient - emerald green */}
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
               </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3'/>
            <XAxis 
              dataKey='month'
              stroke="#64748b"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis hide/>
            <Tooltip/>
            <Legend/>
            <Area
            type='linear'
            dataKey='revenue'
            stroke='#06b6d4'
            strokeWidth={3}
            fill='url(#colorRevenue)'
            />
            <Area
            type='linear'
            dataKey='profit'
            stroke='#02aa40ff'
            strokeWidth={3}
            fill='url(#colorProfit)'
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
        </div>
      </div>
      <div className="chart-container">
      <h3>Sales Trend</h3>
      <div style={{overflowX: 'auto'}}>
      <div style={{minWidth: '600px'}}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="0" 
            stroke="#f1f5f9" 
            vertical={false}
          />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip/>
          <Legend/>
          <Bar 
            dataKey="sales" 
            fill="url(#colorBar)" 
            name="Items Sold"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
      </div>
    </div>
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

  const profitChange = (profit, prevProfit) => {
    if (prevProfit === 0) {
      return {
        percentageChange: 0,
        direction: 'NEUTRAL',
        formattedString: 'N/A'
      }
    }

      const percentageChange = ((profit - prevProfit) / prevProfit) * 100;
      let direction;
      let formattedString;

      if (percentageChange >= 1) {
        direction = 'UP';
        formattedString = percentageChange.toFixed(1) + '%';
      }else if (percentageChange <= -1) {
        direction = 'DOWN';
        formattedString = percentageChange.toFixed(1) + '%';
      }else if (percentageChange === 0) {
        direction = 'NEUTRAL';
        formattedString = '0%'
      }

      return{
        percentageChange: percentageChange,
        direction: direction,
        formattedString: formattedString
      };
    };

  const profitChangeData = profitChange(profit, prevProfit);

  const cost = soldItems.reduce((sum, item )  => {
    return sum + Number(item.purchase_price)
  }, 0);

  // Count sold items
  const sold = soldItems.length;

  const prevSold = prevSoldItems.length;

  const amountSoldChange = (sold, prevSold) => {
    const amountChange = sold - prevSold;
    let direction;
    let formattedString;

    if(amountChange >= 1) {
      direction = 'UP';
      formattedString = '+' + amountChange;
    }else if (amountChange <= -1) {
      direction = 'DOWN';
      formattedString = amountChange;
    }else if (amountChange === 0 ) {
      direction = 'NEUTRAL';
      formattedString = 0;
    }

    return {
      amountChange: amountChange,
      direction: direction,
      formattedString: formattedString
    }
  }

  const amountSoldChangeData = amountSoldChange(sold, prevSold);

  return {
    revenue: revenue.toFixed(0),
    profit: profit.toFixed(0),
    sold: sold,
    cost: cost,
    revenueChange: revenueChangeData,
    profitChange: profitChangeData,
    amountSoldChange: amountSoldChangeData,
    previousEndDate: previousEndDate
  };
}

function prepareChartData(items, period) {
  const soldItems = items.filter(item => item.status === 'SOLD' && item.sold_date);

  const monthGroups = {}; 

  soldItems.forEach(item => {
    const date = new Date(item.sold_date);
    const monthName = date.toLocaleString('en-US', {month: 'short'});

    if (!monthGroups[monthName]) {
      monthGroups[monthName] = [];
    }

    monthGroups[monthName].push(item);
  });

  const chartData = Object.keys(monthGroups).map(month => {
    const itemsInMonth = monthGroups[month];

    const sales = itemsInMonth.length;

    const profit = itemsInMonth.reduce((sum, item) => {
      const itemProfit = Number(item.sold_price || 0) - Number(item.purchase_price || 0);
      return sum + itemProfit;
    }, 0);

    const revenue = itemsInMonth.reduce((sum, item) => {
      const itemRevenue = Number(item.sold_price || 0);
      return sum + itemRevenue
    }, 0);

    return {
      month: month,
      sales: sales,
      profit: profit,
      revenue: revenue
    };
  });

  return chartData;


}

export default Dashboard;
