import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios"; // Import axios for API calls
import { useFinance } from "@/data/FinanceContext";

export default function AdminDashboard() {
  const { transactions } = useFinance();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    monthlyRevenue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch total users
        const usersResponse = await axios.get("http://localhost:5000/api/admin/users/count", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        // Fetch active sessions
        const sessionsResponse = await axios.get("http://localhost:5000/api/admin/sessions/active", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        // Fetch monthly revenue
        const revenueResponse = await axios.get("http://localhost:5000/api/admin/revenue/monthly", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        // Update stats
        setStats({
          totalUsers: usersResponse.data.totalUsers,
          activeSessions: sessionsResponse.data.activeSessions,
          monthlyRevenue: revenueResponse.data.monthlyRevenue,
        });

        // Fetch transactions for chart and recent activity
        const transactionsResponse = await axios.get("http://localhost:5000/api/transactions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        updateDashboardWithTransactions(transactionsResponse.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Initialize empty chart data with all months
  const initializeEmptyChartData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const emptyData = monthNames.map(month => ({ 
      name: month, 
      users: 0, 
      revenue: 0 
    }));
    
    setChartData(emptyData);
  };
  
  // This will be called when we have transactions data from the backend
  const updateDashboardWithTransactions = (transactionsData) => {
    if (!Array.isArray(transactionsData) || transactionsData.length === 0) return;
    
    // Calculate stats based on transaction data
    calculateStats(transactionsData);
    
    // Generate chart data
    generateChartData(transactionsData);
    
    // Get recent activity
    fetchRecentActivity(transactionsData);
  };
  
  const calculateStats = (transactionsData) => {
    if (!Array.isArray(transactionsData)) return;
    
    // Calculate total users - assume each unique userId represents a user
    const uniqueUsers = new Set(transactionsData.map(t => t.userId)).size;
    
    // Calculate active sessions - count transactions in last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentTransactions = transactionsData.filter(t => 
      new Date(t.date) > oneDayAgo
    ).length;
    
    // Calculate monthly revenue from income transactions
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyIncome = transactionsData
      .filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === currentMonth && 
               transDate.getFullYear() === currentYear &&
               t.type === "income";
      })
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    setStats({
      totalUsers: uniqueUsers,
      activeSessions: recentTransactions,
      monthlyRevenue: monthlyIncome
    });
  };
  
  const generateChartData = (transactionsData) => {
    if (!Array.isArray(transactionsData)) return;
    
    // Group transactions by month
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = {};
    
    // Initialize data for all months
    monthNames.forEach(month => {
      monthlyData[month] = { name: month, users: 0, revenue: 0 };
    });
    
    // Populate with actual data
    transactionsData.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = monthNames[date.getMonth()];
      
      if (monthlyData[month]) {
        // Count unique users per month
        if (transaction.userId) {
          monthlyData[month].users += 1;
        }
        
        // Add to revenue if it's an income transaction
        if (transaction.type === "income") {
          monthlyData[month].revenue += parseFloat(transaction.amount) || 0;
        }
      }
    });
    
    // Convert to array for chart
    setChartData(Object.values(monthlyData));
  };
  
  const fetchRecentActivity = (transactionsData) => {
    if (!Array.isArray(transactionsData)) return;
    
    // Get the 5 most recent transactions
    const sortedTransactions = [...transactionsData]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        description: `User ${t.userId || 'Anonymous'} ${t.type === 'income' ? 'received' : 'spent'} $${t.amount}`,
        time: formatTimeAgo(new Date(t.date))
      }));
    
    setRecentActivity(sortedTransactions);
  };
  
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Use transactions data when it becomes available
  useEffect(() => {
    if (Array.isArray(transactions) && transactions.length > 0) {
      updateDashboardWithTransactions(transactions);
    }
  }, [transactions]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
          {stats.totalUsers === 0 && (
            <p className="text-sm text-gray-500 mt-1">Connect to backend to see real data</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Active Sessions</h2>
          <p className="text-3xl font-bold">{stats.activeSessions.toLocaleString()}</p>
          {stats.activeSessions === 0 && (
            <p className="text-sm text-gray-500 mt-1">Connect to backend to see real data</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Monthly Revenue</h2>
          <p className="text-3xl font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
          {stats.monthlyRevenue === 0 && (
            <p className="text-sm text-gray-500 mt-1">Connect to backend to see real data</p>
          )}
        </div>
      </div>

      {/* Admin Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Growth & Revenue</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {chartData.every(item => item.users === 0 && item.revenue === 0) && (
            <p className="text-center text-sm text-gray-500 mt-4">No chart data available. Connect to backend to view statistics.</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="border-b pb-2 last:border-b-0">
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent activity data available</p>
              <p className="text-sm text-gray-500 mt-1">Connect to backend to view activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}