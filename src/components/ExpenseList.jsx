// src/components/ExpenseList.js
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch expenses
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "expenses"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
      setFilteredExpenses(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch categories
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((doc) => doc.data().name));
    });
    return () => unsubscribe();
  }, [user]);

  // Filters and search
  useEffect(() => {
    let temp = [...expenses];

    if (categoryFilter) {
      temp = temp.filter((exp) => exp.category === categoryFilter);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      temp = temp.filter((exp) => exp.createdAt?.toDate() >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      temp = temp.filter((exp) => exp.createdAt?.toDate() <= toDate);
    }

    if (search) {
      const lower = search.toLowerCase();
      temp = temp.filter(
        (exp) =>
          exp.note?.toLowerCase().includes(lower) ||
          exp.category?.toLowerCase().includes(lower)
      );
    }

    setFilteredExpenses(temp);
  }, [categoryFilter, search, dateFrom, dateTo, expenses]);

  return (
    <div className="p-4 bg-darkblue rounded-lg shadow-md text-lightgray">
      <h2 className="text-lg font-bold mb-3 text-blueaccent">Your Expenses</h2>

      {/* Search and Custom Category Dropdown */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 w-1/2 p-2 rounded bg-darkbg border border-blueaccent text-lightgray focus:outline-none focus:ring-1 focus:ring-blueaccent"
        />

        {/* Custom Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded bg-darkbg border border-blueaccent text-lightgray w-40 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-blueaccent"
          >
            {categoryFilter || "All Categories"}
            <span className="ml-2">&#9662;</span>
          </button>
          {dropdownOpen && (
            <div className="absolute mt-1 w-full bg-darkbg border border-blueaccent rounded shadow-lg max-h-48 overflow-y-auto z-50">
              <div
                className="p-2 cursor-pointer hover:bg-blueaccent hover:text-darkbg"
                onClick={() => { setCategoryFilter(""); setDropdownOpen(false); }}
              >
                All Categories
              </div>
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`p-2 cursor-pointer hover:bg-blueaccent hover:text-darkbg ${
                    categoryFilter === cat ? "bg-blueaccent text-darkbg" : ""
                  }`}
                  onClick={() => { setCategoryFilter(cat); setDropdownOpen(false); }}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="p-2 rounded bg-darkbg border border-blueaccent text-lightgray focus:outline-none focus:ring-1 focus:ring-blueaccent"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="p-2 rounded bg-darkbg border border-blueaccent text-lightgray focus:outline-none focus:ring-1 focus:ring-blueaccent"
        />
      </div>
    {/* Expense List */}
<div className="max-h-96 overflow-y-auto">
  {filteredExpenses.length > 0 ? (
    filteredExpenses.map((exp) => (
      <div
        key={exp.id}
        className={`flex flex-col md:flex-row justify-between items-start p-4 rounded-lg mb-2 shadow-md transition-transform hover:scale-105 ${
          exp.category.toLowerCase() === "income"
            ? "border-2 border-green-400"
            : "border-2 border-red-400"
        } bg-darkbg`}
      >
        {/* Left: Category & Amount */}
        <div className="flex flex-row items-center gap-2">
          <span className="font-bold text-lg">{exp.category}</span>
          <span
            className={`text-md font-semibold ${
              exp.category.toLowerCase() === "income" ? "text-green-400" : "text-red-400"
            }`}
          >
            ₹{exp.amount}
          </span>
          
        </div>
        {/* Note below */}
        {exp.note && (
          <div className="mt-2 text-sm text-lightgray w-full md:mt-1">
            {exp.note}
          </div>
        )}

        {/* Right: Date */}
        <div className="text-xs text-lightgray ml-auto">
          {exp.createdAt?.toDate().toLocaleDateString()}
        </div>

        
      </div>
    ))
  ) : (
    <p className="text-center text-lightgray mt-4">No expenses found</p>
  )}
</div>

    </div>
  );
}
