import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [txRes, budgetRes] = await Promise.all([
          axios.get("http://localhost:5000/api/transactions", {
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          }),
        ]);
        setTransactions(txRes.data);
      } catch (error) {
        console.error("Loading error:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Budget check logic
  const checkBudgetLimits = (newTransaction) => {
    if (newTransaction.type !== "expense") return;

    const updatedBudgets = budgets.map((budget) => {
      if (budget.category === newTransaction.category) {
        const newSpent = budget.spent + newTransaction.amount;
        const isExceeded = newSpent > budget.limit;

        if (isExceeded) {
          setBudgetAlerts((prev) => [
            ...prev,
            {
              category: budget.category,
              exceededBy: newSpent - budget.limit,
              period: budget.period,
            },
          ]);
        }

        return { ...budget, spent: newSpent };
      }
      return budget;
    });

    setBudgets(updatedBudgets);
  };

  const addTransaction = async (transaction) => {
    try {
      const response = await axios.post("http://localhost:5000/api/transactions", transaction, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setTransactions((prev) => [...prev, response.data]);
      checkBudgetLimits(response.data);
    } catch (error) {
      console.error("Transaction error:", error);
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        isLoading,
        budgetAlerts,
        addTransaction,
        setBudgets,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => useContext(FinanceContext);