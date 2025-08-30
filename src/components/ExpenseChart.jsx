import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy, doc } from "firebase/firestore";
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
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);

  // ✅ Bank Filter
  const [banks, setBanks] = useState([]);
  const [bankWise, setBankWise] = useState(false);
  const [selectedBank, setSelectedBank] = useState("all");

  // ✅ Fetch bankWise setting
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBankWise(data.bankWise || false);
      }
    });
    return () => unsub();
  }, [user]);

  // ✅ Fetch banks if enabled
  useEffect(() => {
    if (!user || !bankWise) return;
    const banksRef = collection(db, "users", user.uid, "banks");
    const unsub = onSnapshot(banksRef, (snap) => {
      setBanks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user, bankWise]);

  useEffect(() => {
    if (!user?.uid) return;

    const expensesRef = collection(db, "users", user.uid, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMap = {};
      const thisMonthMap = {};
      const monthMap = {};
      const categoriesSet = new Set();
      const yearsSet = new Set();

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      snapshot.docs.forEach((doc) => {
        const { category = "Unknown", amount, note, createdAt, bankId } = doc.data();
        const date = createdAt?.toDate();
        if (!date) return;

        // ✅ Apply Bank filter
        if (bankWise && selectedBank !== "all" && bankId !== selectedBank) return;

        // Collect available years
        yearsSet.add(date.getFullYear());

        // Apply extra filters
        if (filterCategory && category !== filterCategory) return;
        if (filterFrom && date < new Date(filterFrom)) return;
        if (filterTo && date > new Date(filterTo)) return;
        if (search) {
          const lower = search.toLowerCase();
          if (!category.toLowerCase().includes(lower) && !note?.toLowerCase().includes(lower)) return;
        }

        if (category.toLowerCase() !== "income") categoriesSet.add(category);

        // This month pie
        if (category.toLowerCase() !== "income" && date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          thisMonthMap[category] = (thisMonthMap[category] || 0) + amount;
        }

        // Monthly bar
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!monthMap[key]) monthMap[key] = { month: key, year: date.getFullYear(), monthIndex: date.getMonth(), income: 0, expenses: {} };

        if (category.toLowerCase() === "income") monthMap[key].income += amount;
        else monthMap[key].expenses[category] = (monthMap[key].expenses[category] || 0) + amount;

        // All time pie
        if (category.toLowerCase() !== "income") {
          allMap[`${date.getFullYear()}-${date.getMonth() + 1}-${category}`] =
            (allMap[`${date.getFullYear()}-${date.getMonth() + 1}-${category}`] || 0) + amount;
        }
      });

      setYears(Array.from(yearsSet).sort((a, b) => b - a));
      setExpenseCategories(Array.from(categoriesSet));

      // ✅ Quarter filter
      const startMonth = (selectedQuarter - 1) * 3;
      const endMonth = startMonth + 2;

      // Pie (quarter)
      const filteredPieMap = {};
      Object.entries(allMap).forEach(([key, value]) => {
        const [y, m, category] = key.split("-");
        const year = parseInt(y, 10);
        const month = parseInt(m, 10) - 1;
        if (year === selectedYear && month >= startMonth && month <= endMonth) {
          filteredPieMap[category] = (filteredPieMap[category] || 0) + value;
        }
      });
      setAllData(Object.entries(filteredPieMap).map(([name, value]) => ({ name, value })));

      // Bar (quarter)
      const months = Object.values(monthMap).filter(
        (m) => m.year === selectedYear && m.monthIndex >= startMonth && m.monthIndex <= endMonth
      ).sort((a, b) => new Date(a.month + "-01") - new Date(b.month + "-01"));

      const monthDataForBar = months.map((m) => {
        const monthObj = {
          month: new Date(m.month + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
          income: m.income
        };
        Array.from(categoriesSet).forEach((cat) => {
          monthObj[cat] = m.expenses[cat] || 0;
        });
        return monthObj;
      });

      setMonthlyData(monthDataForBar);
      setThisMonthData(Object.entries(thisMonthMap).map(([name, value]) => ({ name, value })));
    });

    return () => unsubscribe();
  }, [user, filterCategory, filterFrom, filterTo, search, selectedYear, selectedQuarter, selectedBank, bankWise]);

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

        <Bar dataKey="income" fill="#00C49F" />
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
    <div className="h-full flex flex-col gap-6 overflow-y-auto">
      <div className="p-4 bg-darkblue rounded-lg shadow-md text-lightgray">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="font-bold text-lg text-blueaccent">Expenses by Category (All Time)</h2>
          <div className="flex gap-2 mt-2 md:mt-0">

            {/* ✅ Bank Filter */}
            {bankWise && (
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="bg-darkblue border border-blueaccent text-lightgray px-2 py-1 rounded"
              >
                <option value="all">All Banks</option>
                {banks.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-darkblue border border-blueaccent text-lightgray px-2 py-1 rounded"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
              className="bg-darkblue border border-blueaccent text-lightgray px-2 py-1 rounded"
            >
              <option value={1}>Q1 (Jan - Mar)</option>
              <option value={2}>Q2 (Apr - Jun)</option>
              <option value={3}>Q3 (Jul - Sep)</option>
              <option value={4}>Q4 (Oct - Dec)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-center font-semibold mb-2">This Month</h3>
            {thisMonthData.length ? renderPie(thisMonthData) : <p className="text-lightgray text-center">No data</p>}
          </div>
          <div className="flex-1">
            <h3 className="text-center font-semibold mb-2">Selected Quarter</h3>
            {allData.length ? renderPie(allData) : <p className="text-lightgray text-center">No data</p>}
          </div>
        </div>
      </div>

      <div className="p-4 bg-darkblue rounded-lg shadow-md text-lightgray">
        <h2 className="font-bold text-lg mb-2 text-blueaccent">Monthly Income vs Expense</h2>
        {monthlyData.length ? renderBar() : <p className="text-lightgray text-center">No data</p>}
      </div>
    </div>
  );
}
