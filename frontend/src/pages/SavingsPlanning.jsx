import React, { useState, useEffect, useMemo } from "react";
import {
  PiggyBank,
  Target,
  TrendingUp,
  Brain,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const fetchBackendRecommendations = async (userId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/history-recommendations?userId=${userId}&k=5`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch recommendations from the backend");
    }
    const data = await response.json();
    return data; // List of recommended items
  } catch (error) {
    console.error(error);
    toast.error("Error fetching backend recommendations");
    return [];
  }
};

const fetchGoalRecommendations = async (goal) => {
  try {
    const response = await fetch("http://localhost:5000/api/goal-recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(goal),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch goal recommendations from the backend");
    }
    const data = await response.json();
    return data; // List of recommendations
  } catch (error) {
    console.error(error);
    toast.error("Error fetching goal recommendations");
    return [];
  }
};

const SavingsGoalForm = ({ onAddGoal }) => {
  const [goal, setGoal] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
    months: "",
  });



  // Calculate insights based on the goal
  const remainingAmount = useMemo(() => {
    return goal.targetAmount - goal.currentAmount > 0
      ? goal.targetAmount - goal.currentAmount
      : 0;
  }, [goal.targetAmount, goal.currentAmount]);

  const percentageAchieved = useMemo(() => {
    return goal.targetAmount > 0
      ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2)
      : 0;
  }, [goal.targetAmount, goal.currentAmount]);

  const estimatedMonthlySavings = useMemo(() => {
    if (!goal.targetDate || remainingAmount <= 0) return 0;
    const targetDate = new Date(goal.targetDate);
    const currentDate = new Date();
    const monthsToTarget = Math.max(
      (targetDate.getFullYear() - currentDate.getFullYear()) * 12 +
        targetDate.getMonth() -
        currentDate.getMonth(),
      1
    );
    return (remainingAmount / monthsToTarget).toFixed(2);
  }, [goal.targetDate, remainingAmount]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (goal.name && goal.targetAmount) {
        const recommendations = await fetchGoalRecommendations(goal);
        setAIRecommendations(recommendations);
      }
    };
    fetchRecommendations();
  }, [goal]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!goal.name) {
      toast.error("Please select a goal type.");
      return false;
    }
    if (!goal.targetAmount || goal.targetAmount <= 0) {
      toast.error("Target amount must be greater than 0.");
      return false;
    }
    if (!goal.targetDate) {
      toast.error("Please select a target date.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Fetch backend recommendations
    const userId = "123"; // Replace with actual user ID logic
    const backendRecs = await fetchBackendRecommendations(userId);
    setBackendRecommendations(backendRecs);

    onAddGoal(goal);
    toast.success("Savings goal added successfully!");

    // Reset form
    setGoal({
      name: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: "",
      months: "",
    });
    setAIRecommendations([]);
  };

  const goalTypes = useMemo(
    () => ["Emergency Fund", "Vacation", "Home Down Payment", "Car Purchase", "Other"],
    []
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Target className="mr-2 text-blue-500" size={24} />
        Create Smart Savings Goal
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Goal Type</label>
            <select
              name="name"
              value={goal.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select Goal Type</option>
              {goalTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Target Amount</label>
            <input
              type="number"
              name="targetAmount"
              value={goal.targetAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="$5,000"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Current Savings</label>
            <input
              type="number"
              name="currentAmount"
              value={goal.currentAmount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="$1,000"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Target Date</label>
            <input
              type="date"
              name="targetDate"
              value={goal.targetDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Add Savings Goal
          </button>
        </div>

        <div>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Brain className="mr-2 text-purple-600" size={24} />
              Goal Insights
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Remaining Amount:</span>
                <span className="font-bold text-red-600">${remainingAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Percentage Achieved:</span>
                <span className="font-bold text-green-600">{percentageAchieved}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estimated Monthly Savings:</span>
                <span className="font-bold text-blue-600">${estimatedMonthlySavings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SavingsPlanning = () => {
  const [savedGoals, setSavedGoals] = useState([]);

  const addGoal = (newGoal) => {
    setSavedGoals((prevGoals) => [
      ...prevGoals,
      {
        ...newGoal,
        id: Date.now(),
      },
    ]);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center mb-6">
        <PiggyBank className="mr-4 text-blue-600" size={40} />
        <h1 className="text-3xl font-bold text-gray-800">AI-Powered Savings Planner</h1>
      </div>

      <SavingsGoalForm onAddGoal={addGoal} />

      {savedGoals.length > 0 && (
        <div className="mt-6 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-500" size={24} />
            Your Savings Goals
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedGoals.map((goal) => (
              <div
                key={goal.id}
                className="border rounded-md p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{goal.name}</h3>
                  <span className="text-green-600 font-bold">
                    ${goal.currentAmount} / ${goal.targetAmount}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Target Date: {goal.targetDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsPlanning;