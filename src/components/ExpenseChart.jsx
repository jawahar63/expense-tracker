// src/components/ExpenseChart.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0"];

export default function ExpenseChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoryMap = {};
      snapshot.docs.forEach((doc) => {
        const { category, amount } = doc.data();
        if (categoryMap[category]) categoryMap[category] += amount;
        else categoryMap[category] = amount;
      });
      const data = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
      setChartData(data);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-2">Expenses by Category</h2>
      <PieChart width={300} height={300}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
