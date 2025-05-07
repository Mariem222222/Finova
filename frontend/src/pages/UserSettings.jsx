import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Use axios for API calls
import { Search, Edit, Trash, ChevronDown, ChevronUp, Filter, Download, Eye, Ban, Shield, AlertTriangle } from "lucide-react";
import { useFinance } from "@/data/FinanceContext";

export default function UserSettings() {
  const { transactions } = useFinance();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'lastActive', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    flagged: 0,
  });

  // Load user data from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        const data = response.data;
        setUsers(data);
        setFilteredUsers(data);

        // Update stats based on fetched data
        setUserStats({
          total: data.length,
          active: data.filter((u) => u.status === 'active').length,
          inactive: data.filter((u) => u.status === 'inactive').length,
          flagged: data.filter((u) => u.flags && u.flags.length > 0).length,
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Search and filter users
  useEffect(() => {
    let result = [...users];
    
    // Apply search
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'flagged') {
        result = result.filter(user => user.flags.length > 0);
      } else {
        result = result.filter(user => user.status === filterStatus);
      }
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredUsers(result);
  }, [users, searchTerm, sortConfig, filterStatus]);
  
  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(selectedUser && selectedUser.id === user.id ? null : user);
  };
  
  // Handle user status change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      const updatedUser = response.data;
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, status: updatedUser.status } : user
      );

      setUsers(updatedUsers);

      // Update selected user if needed
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: updatedUser.status });
      }

      // Update stats
      updateUserStats(updatedUsers);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  
  // Update user statistics based on current users
  const updateUserStats = (currentUsers) => {
    setUserStats({
      total: currentUsers.length,
      active: currentUsers.filter(u => u.status === 'active').length,
      inactive: currentUsers.filter(u => u.status === 'inactive').length,
      flagged: currentUsers.filter(u => u.flags.length > 0).length
    });
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);

        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null);
        }

        // Update stats
        updateUserStats(updatedUsers);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };
  
  // Export user data as CSV
  const exportUserData = () => {
    const headers = ['ID', 'Name', 'Email', 'Status', 'Join Date', 'Last Active', 'Transactions', 'Total Spent', 'Savings'];
    
    let csvContent = headers.join(',') + '\n';
    
    filteredUsers.forEach(user => {
      const row = [
        user.id,
        `"${user.name}"`,
        `"${user.email}"`,
        user.status,
        formatDate(user.joinDate),
        formatDate(user.lastActive),
        user.transactionCount,
        user.totalSpent.toFixed(2),
        user.savings.toFixed(2)
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // User detail view - transactions for the selected user
  const renderUserDetails = () => {
    if (!selectedUser) return null;
    
    // This will be replaced with an API call to get user transactions
    const userTransactions = []; // Empty until backend is connected
    
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center bg-gray-50 p-4 border-b">
          <h3 className="font-semibold text-lg">User Details: {selectedUser.name}</h3>
          <button 
            onClick={() => setSelectedUser(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold">{selectedUser.transactionCount}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold">${selectedUser.totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Savings</p>
              <p className="text-2xl font-bold">${selectedUser.savings.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-2xl font-bold">{formatDate(selectedUser.joinDate)}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Account Actions</h4>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center text-sm">
                <Shield className="w-4 h-4 mr-1" /> Reset Password
              </button>
              <button 
                className={`px-3 py-1 rounded text-sm flex items-center ${
                  selectedUser.status === 'active' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
                onClick={() => handleStatusChange(
                  selectedUser.id, 
                  selectedUser.status === 'active' ? 'inactive' : 'active'
                )}
              >
                {selectedUser.status === 'active' ? (
                  <>
                    <Ban className="w-4 h-4 mr-1" /> Suspend Account
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" /> Activate Account
                  </>
                )}
              </button>
              {selectedUser.flags.length > 0 && (
                <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 flex items-center text-sm">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Review Flags
                </button>
              )}
            </div>
          </div>
          
          <h4 className="font-medium mb-2">Recent Transactions</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userTransactions.length > 0 ? (
                  userTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-800' :
                          transaction.type === 'expense' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-2">{transaction.category}</td>
                      <td className="px-4 py-2">${transaction.amount.toFixed(2)}</td>
                      <td className="px-4 py-2">{formatDate(transaction.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-500">
                      No transaction data available. Connect to backend to view user transactions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View All Transactions
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{userStats.total}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Users</p>
            <p className="text-2xl font-bold">{userStats.active}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <div className="rounded-full bg-gray-100 p-3 mr-4">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Inactive Users</p>
            <p className="text-2xl font-bold">{userStats.inactive}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <div className="rounded-full bg-orange-100 p-3 mr-4">
            <Flag className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Flagged Accounts</p>
            <p className="text-2xl font-bold">{userStats.flagged}</p>
          </div>
        </div>
      </div>
      
      {/* Controls and Search */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-xl font-semibold mb-2 md:mb-0">Users</h2>
          
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="flagged">Flagged Accounts</option>
              </select>
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button 
              onClick={exportUserData}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={users.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* Users table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th 
                  className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'status' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('joinDate')}
                >
                  <div className="flex items-center">
                    Join Date
                    {sortConfig.key === 'joinDate' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('lastActive')}
                >
                  <div className="flex items-center">
                    Last Active
                    {sortConfig.key === 'lastActive' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('transactionCount')}
                >
                  <div className="flex items-center">
                    Transactions
                    {sortConfig.key === 'transactionCount' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="w-4 h-4 ml-1" /> : 
                        <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr 
                    key={user.id}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedUser && selectedUser.id === user.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-gray-500">{user.email}</div>
                        </div>
                        {user.flags.length > 0 && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Flagged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.joinDate)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.lastActive)}</td>
                    <td className="px-4 py-3 text-gray-500">{user.transactionCount}</td>
                    <td className="px-4 py-3 text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.alert(`Edit user: ${user.name}`);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUser(user.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No users available. Connect to backend to load user data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {searchTerm && filteredUsers.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No users found matching your search criteria.</p>
          </div>
        )}
      </div>
      
      {/* Selected User Details */}
      {renderUserDetails()}
    </div>
  );
}

// Mock components for the icons
function User(props) { return <div {...props} />; }
function CheckCircle(props) { return <div {...props} />; }
function Clock(props) { return <div {...props} />; }
function Flag(props) { return <div {...props} />; }