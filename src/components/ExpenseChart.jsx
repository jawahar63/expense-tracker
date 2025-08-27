// src/components/ExpenseChart.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const PIE_COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0",
  "#FF6384", "#36A2EB", "#FFCE56"
];

const EXPENSE_COLORS = [
  "#FF6384", "#FF9F40", "#FFCD56", "#4BC0C0", "#36A2EB", "#9966FF"
];

export default function ExpenseChart({ filterCategory, filterFrom, filterTo, search }) {
  const { user } = useAuth();
  const [allData, setAllData] = useState([]);
  const [thisMonthData, setThisMonthData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "expenses"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMap = {};
      const thisMonthMap = {};
      const monthMap = {};
      const categoriesSet = new Set();

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      snapshot.docs.forEach((doc) => {
        const { category, amount, note, type, createdAt } = doc.data();
        const date = createdAt?.toDate();
        if (!date) return;

        // Apply external filters
        if (filterCategory && category.toLowerCase() !== filterCategory.toLowerCase()) return;
        if (filterFrom && date < new Date(filterFrom)) return;
        if (filterTo && date > new Date(filterTo)) return;
        if (search) {
          const lower = search.toLowerCase();
          if (!category.toLowerCase().includes(lower) && !note?.toLowerCase().includes(lower)) return;
        }

        if (type === "expense") categoriesSet.add(category);

        // Pie Chart All Data
        allMap[category] = (allMap[category] || 0) + amount;

        // Pie Chart This Month
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          thisMonthMap[category] = (thisMonthMap[category] || 0) + amount;
        }

        // Bar Chart monthly
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!monthMap[key]) monthMap[key] = { month: key, income: 0 };
        if (!monthMap[key].expenses) monthMap[key].expenses = {};

        if (type === "income") monthMap[key].income += amount;
        else monthMap[key].expenses[category] = (monthMap[key].expenses[category] || 0) + amount;
      });

      // Transform monthMap into array suitable for grouped/staked bar chart
      const months = Object.values(monthMap).sort((a, b) => new Date(a.month + "-01") - new Date(b.month + "-01"));
      const monthDataForBar = months.map((m) => ({
        month: new Date(m.month + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
        income: m.income,
        ...m.expenses
      }));

      setAllData(Object.entries(allMap).map(([name, value]) => ({ name, value })));
      setThisMonthData(Object.entries(thisMonthMap).map(([name, value]) => ({ name, value })));
      setMonthlyData(monthDataForBar);
      setExpenseCategories([...categoriesSet]);
    });

    return () => unsubscribe();
  }, [user, filterCategory, filterFrom, filterTo, search]);

  const renderPie = (data) => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: "#010C16", border: "none", color: "#EFEFEF" }} itemStyle={{ color: "#EFEFEF" }} />
        <Legend wrapperStyle={{ color: "#EFEFEF" }} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderBar = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#022040" />
        <XAxis dataKey="month" stroke="#EFEFEF" />
        <YAxis stroke="#EFEFEF" />
        <Tooltip contentStyle={{ backgroundColor: "#010C16", border: "none", color: "#EFEFEF" }} />
        <Legend wrapperStyle={{ color: "#EFEFEF" }} />

        {/* Income Bar */}
        <Bar dataKey="income" fill="#00C49F" />

        {/* Expense Bars stacked by category */}
        {expenseCategories.map((cat, index) => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId="expenses"
            fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Pie - This Month */}
      <div className="p-4 bg-darkblue rounded-lg shadow-md text-lightgray">
        <h2 className="font-bold text-lg mb-2 text-blueaccent">Expenses by Category (This Month)</h2>
        {thisMonthData.length ? renderPie(thisMonthData) : <p className="text-lightgray text-center">No data</p>}
      </div>

      {/* Pie - All */}
      <div className="p-4 bg-darkblue rounded-lg shadow-md text-lightgray">
        <h2 className="font-bold text-lg mb-2 text-blueaccent">Expenses by Category (All Time)</h2>
        {allData.length ? renderPie(allData) : <p className="text-lightgray text-center">No data</p>}
      </div>

      {/* Bar - Monthly Income vs Expense (stacked) */}
      <div className="p-4 bg-darkblue rounded-lg shadow-md text-lightgray">
        <h2 className="font-bold text-lg mb-2 text-blueaccent">Monthly Income vs Expense</h2>
        {monthlyData.length ? renderBar() : <p className="text-lightgray text-center">No data</p>}
      </div>
    </div>
  );
}
