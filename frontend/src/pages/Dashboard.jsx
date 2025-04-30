import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Home, LogOut, Menu, X } from "lucide-react";
import Charts from "@/widgets/cards/Charts";
import { useFinance } from "@/data/FinanceContext";

// Sample data for the sales chart
const salesData = [
  { name: "Jan", current: 400, previous: 300 },
  { name: "Feb", current: 500, previous: 400 },
  { name: "Mar", current: 600, previous: 550 },
  { name: "Apr", current: 800, previous: 650 },
  { name: "May", current: 750, previous: 700 },
  { name: "Jun", current: 900, previous: 800 },
  { name: "Jul", current: 1000, previous: 850 },
];

export default function Dashboard() {
  const { transactions } = useFinance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const calculateStats = () => {
    const stats = {
      savings: 0,
      income: 0,
      expenses: 0
    };

    if (Array.isArray(transactions)) {
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;
        
        switch(transaction.type) {
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

  const handleLogout = () => {
    localStorage.removeItem('transactions');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navigateToHome = () => {
    window.location.href = '/';
  };

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
        {/* Sales Report */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales Report</h2>
          <div className="flex justify-between mb-4">
            <div>
              <h3 className="text-blue-600 text-2xl font-bold">$15,000</h3>
              <p className="text-gray-500">This Month</p>
            </div>
            <div>
              <h3 className="text-gray-600 text-2xl font-bold">$10,000</h3>
              <p className="text-gray-500">Last Month</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="current" stroke="#4F46E5" strokeWidth={2} />
                <Line type="monotone" dataKey="previous" stroke="#9CA3AF" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
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