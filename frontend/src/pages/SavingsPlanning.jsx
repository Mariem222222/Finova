import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PiggyBank, Target, TrendingUp, Brain } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

// Optimized API calls with caching
const fetchRecommendations = {
  backend: async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      
      if (!userId) {
        console.error("User ID is missing in localStorage.");
        toast.error("User ID is missing. Please log in again.");
        return [];
      }

      const res = await axios.get(`http://localhost:5000/api/history-recommendations?userId=${userId}&k=5`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      console.log("Fetched history recommendations:", res.data); // Debug log
      return res.data;
    } catch (error) {
      // console.error("Error fetching history recommendations:", error);
      // toast.error("Error fetching history recommendations");
      return [];
    }
  },
  
  goal: async (goal) => {
    try {
      const res = await fetch("http://localhost:5000/api/goal-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (!res.ok) throw new Error('Failed to fetch goal recommendations');
      return await res.json();
    } catch (error) {
      // toast.error("Error fetching goal recommendations");
      return [];
    }
  }
};

const SavingsGoalForm = ({ onAddGoal }) => {
  const [goal, setGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
  });

  const [customGoal, setCustomGoal] = useState(""); // New state for custom goal
  const [recommendations, setRecommendations] = useState({ ai: [], backend: [] });

  // Memoized calculations
  const { remainingAmount, percentageAchieved, estimatedMonthlySavings } = useMemo(() => {
    const target = parseFloat(goal.targetAmount) || 0;
    const current = parseFloat(goal.currentAmount) || 0;
    const remaining = Math.max(target - current, 0);
    
    const percentage = target > 0 ? ((current / target) * 100).toFixed(2) : 0;
    
    let monthly = 0;
    if (goal.targetDate && remaining > 0) {
      const targetDate = new Date(goal.targetDate);
      const currentDate = new Date();
      const months = Math.max(
        (targetDate.getFullYear() - currentDate.getFullYear()) * 12 +
        targetDate.getMonth() - currentDate.getMonth(),
        1
      );
      monthly = (remaining / months).toFixed(2);
    }
    
    return { remainingAmount: remaining, percentageAchieved: percentage, estimatedMonthlySavings: monthly };
  }, [goal]);

  // Debounced recommendation fetching
  useEffect(() => {
    if (!goal.name || !goal.targetAmount) return;

    const timeoutId = setTimeout(async () => {
      const [aiRecs, backendRecs] = await Promise.all([
        fetchRecommendations.goal(goal),
        fetchRecommendations.backend("123")
      ]);
      setRecommendations({ ai: aiRecs, backend: backendRecs });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [goal]);

  const handleSubmit = useCallback(async () => {
    if (!goal.name && !customGoal.trim()) {
      toast.error("Please select a goal type or enter a custom goal.");
      return;
    }

    const goalName = goal.name || customGoal.trim();
    if (!goalName) {
      toast.error("Goal name cannot be empty.");
      return;
    }

    if (!goal.targetAmount || !goal.targetDate) {
      toast.error("Please fill all required fields");
      return;
    }

    const newGoalData = { ...goal, name: goalName };

    try {
      const authToken = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:5000/api/savings-goals",
        newGoalData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      onAddGoal(response.data); // Pass the saved goal to the parent component
      toast.success("Goal added successfully!");
      setGoal({ name: "", targetAmount: "", currentAmount: "", targetDate: "" });
      setCustomGoal(""); // Clear custom goal input
    } catch (error) {
      console.error("Error creating savings goal:", error);
      toast.error("Failed to create savings goal");
    }
  }, [goal, onAddGoal, customGoal]);

  const handleCustomGoalChange = (e) => {
    setCustomGoal(e.target.value);
    setGoal(prev => ({ ...prev, name: "" })); // Clear selected goal type
  };

  const goalTypes = useMemo(
    () => ["Emergency Fund", "Vacation", "Home Down Payment", "Car Purchase", "Other"],
    []
  );

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <header className="flex items-center mb-6">
        <Target className="text-blue-500 mr-3" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Smart Savings Planner</h2>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
            <select
              name="name"
              value={goal.name}
              onChange={(e) => setGoal(g => ({ ...g, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Select a goal</option>
              {goalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Or enter a custom goal"
              value={customGoal}
              onChange={handleCustomGoalChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 mt-2"
            />
          </div>

          {[['Target Amount', 'targetAmount', 'number', '$5,000'], 
            ['Current Savings', 'currentAmount', 'number', '$1,000'],
            ['Target Date', 'targetDate', 'date']].map(([label, name, type, placeholder]) => (
            <div key={name} className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <input
                type={type}
                name={name}
                value={goal[name]}
                onChange={(e) => setGoal(g => ({ ...g, [name]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300"
                placeholder={placeholder}
                min={0}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Create Savings Plan
          </button>
        </div>

        <div className="bg-gray-50 p-5 rounded-xl">
          <div className="flex items-center mb-4">
            <Brain className="text-purple-500 mr-2" size={24} />
            <h3 className="text-lg font-semibold">Goal Analytics</h3>
          </div>
          
          <div className="space-y-4">
            <MetricCard
              label="Remaining Amount"
              value={`$${remainingAmount}`}
              color="text-red-500"
              icon="💸"
            />
            <MetricCard
              label="Progress"
              value={`${percentageAchieved}%`}
              color="text-green-500"
              icon="📈"
              extra={<ProgressBar percentage={percentageAchieved} />}
            />
            <MetricCard
              label="Monthly Savings Needed"
              value={`$${estimatedMonthlySavings}`}
              color="text-blue-500"
              icon="🗓️"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInterface = () => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    
    try {
      setIsLoading(true);
      const { data } = await await axios.post(
        "http://localhost:5000/api/chatbot", { question: chatInput });
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: data.response,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      toast.error("Failed to get chatbot response");
    } finally {
      setIsLoading(false);
    }
  }, [chatInput, isLoading]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="h-96 mb-4 overflow-y-auto space-y-3 pr-3">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about savings strategies..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Spinner />
              Analyzing...
            </span>
          ) : 'Send'}
        </button>
      </div>
    </div>
  );
};

// Optimized sub-components
const MetricCard = ({ label, value, color, icon, extra }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className={`${color} font-semibold`}>{value}</span>
    </div>
    {extra && <div className="mt-2">{extra}</div>}
  </div>
);

const ProgressBar = ({ percentage }) => (
  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div 
      className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
      style={{ width: `${percentage}%` }}
    />
  </div>
);

const ChatBubble = ({ message }) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] p-4 rounded-2xl ${
      message.sender === 'user' 
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-gray-100 text-gray-800 rounded-bl-none'
    }`}>
      <div className="text-sm">{message.text}</div>
      {message.timestamp && (
        <div className="mt-2 text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  </div>
);

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function SavingsPlanning() {
  const [goals, setGoals] = useState([]);

  const addGoal = useCallback((newGoal) => {
    setGoals(prev => [...prev, newGoal]);
  }, []);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        const response = await axios.get("http://localhost:5000/api/savings-goals", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setGoals(response.data);
      } catch (error) {
        console.error("Error fetching savings goals:", error);
        toast.error("Failed to load savings goals");
      }
    };

    fetchGoals();
  }, []);

  const isNearingTargetDate = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffInDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diffInDays <= 30 && diffInDays >= 0; // Within 30 days
  };

  const hasTargetDatePassed = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    return target < now;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <PiggyBank className="text-blue-500" size={40} />
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Financial Planner</h1>
        </header>

        <SavingsGoalForm onAddGoal={addGoal} />

        {goals.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-500" size={24} />
              Your Active Goals
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(goal => {
                const nearing = isNearingTargetDate(goal.targetDate);
                const passed = hasTargetDatePassed(goal.targetDate);
                return (
                  <div key={goal.id} className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{goal.name}</h3>
                      <span className="text-green-600 font-medium">
                        ${goal.currentAmount} / ${goal.targetAmount}
                      </span>
                    </div>
                    <div className={`text-sm ${nearing || passed ? 'text-red-500' : 'text-gray-500'}`}>
                      Target: {goal.targetDate}
                    </div>
                    <ProgressBar percentage={(goal.currentAmount / goal.targetAmount * 100).toFixed(2)} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <ChatInterface />
      </div>
    </div>
  );
}