import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Home, LogOut, Menu, X } from "lucide-react";
import Charts from "@/widgets/cards/Charts";
import { useFinance } from "@/data/FinanceContext";
import axios from "axios";

export default function Dashboard() {
  const { transactions } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [salesData, setSalesData] = useState([]);

  const calculateStats = () => {
    const stats = {
      savings: 0,
      income: 0,
      expenses: 0
    };

    if (Array.isArray(transactions)) {
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;

        switch (transaction.type) {
          case "income":
            stats.income += amount;
            break;
          case "expense":
            stats.expenses += amount;
            break;
          case "savings":
            stats.savings += amount;
            break;
        }
      });

      if (stats.savings === 0) {
        stats.savings = stats.income - stats.expenses;
      }
    }

    return stats;
  };

  const stats = calculateStats();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/transactions/sales/monthly", {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
        });
        setSalesData(res.data);
      } catch (err) {
        setSalesData([]); // fallback
      }
    };
    fetchSales();
  }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem('transactions');
  //   localStorage.removeItem('user');
  //   window.location.href = '/login';
  // };

  const navigateToHome = () => {
    window.location.href = '/';
  };

  // Calculate revenue insights
  const totalRevenue = salesData.reduce((sum, item) => sum + (item.total || 0), 0);
  const bestMonth = salesData.reduce((best, item) => (item.total > (best?.total || 0) ? item : best), null);

  return (
    <div className="flex-1 p-6 overflow-auto">
      <h1 className="text-2xl font-bold mb-4">General</h1>

      {/* Stats Cards Section - Dynamic based on transactions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <div className="text-green-500 text-2xl mb-2">💰</div>
          <h2 className="text-4xl font-bold mb-1">${stats.savings.toFixed(2)}</h2>
          <p className="text-gray-600">Savings</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <div className="text-blue-500 text-2xl mb-2">📈</div>
          <h2 className="text-4xl font-bold mb-1">${stats.income.toFixed(2)}</h2>
          <p className="text-gray-600">Income</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <div className="text-red-500 text-2xl mb-2">📉</div>
          <h2 className="text-4xl font-bold mb-1">${stats.expenses.toFixed(2)}</h2>
          <p className="text-gray-600">Expenses</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <div className="text-yellow-500 text-2xl mb-2">📄</div>
          <h2 className="text-4xl font-bold mb-1">{transactions.length}</h2>
          <p className="text-gray-600">Transactions</p>
        </div>
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Revenue Insights */}
        <div className="bg-gradient-to-br from-indigo-100 to-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
            <span role="img" aria-label="insight">💡</span> Revenue Insights
          </h2>
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-indigo-600 text-2xl font-bold">${totalRevenue.toLocaleString()}</h3>
              <p className="text-gray-500">Total Revenue (12 months)</p>
            </div>
            <div>
              <h3 className="text-green-600 text-2xl font-bold">{bestMonth ? bestMonth.name : '--'}</h3>
              <p className="text-gray-500">Best Month</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={3} dot={{ r: 5, stroke: '#6366F1', strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <span role="img" aria-label="info">ℹ️</span> This chart shows your income trends over the past year. Use these insights to plan your business growth!
          </div>
        </div>

        {/* Monthly Invoice Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Financial Overview</h2>
          <div className="h-64">
            <Charts />
          </div>
        </div>
      </div>
    </div>
  );
}