// src/components/ExpenseList.js
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
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
  const [deleteId, setDeleteId] = useState(null); // ID of expense to delete
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
    const expensesRef = collection(db, "users", user.uid, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "desc"));
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
    const categoriesRef = collection(db, "users", user.uid, "categories");
    const q = query(categoriesRef, orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "expenses", id));
      setDeleteId(null); // close popup
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Filters
  useEffect(() => {
    let temp = [...expenses];
    if (categoryFilter) temp = temp.filter((exp) => exp.categoryId === categoryFilter);
    if (dateFrom) temp = temp.filter((exp) => exp.createdAt?.toDate() >= new Date(dateFrom));
    if (dateTo) temp = temp.filter((exp) => exp.createdAt?.toDate() <= new Date(dateTo));
    if (search) {
      const lower = search.toLowerCase();
      temp = temp.filter(
        (exp) =>
          exp.note?.toLowerCase().includes(lower) ||
          getCategoryName(exp.categoryId)?.toLowerCase().includes(lower)
      );
    }
    setFilteredExpenses(temp);
  }, [categoryFilter, search, dateFrom, dateTo, expenses, categories]);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || "Unknown";

  return (
    <div className="p-4 bg-darkblue rounded-lg shadow-md text-lightgray relative">
      <h2 className="text-lg font-bold mb-3 text-blueaccent">Your Expenses</h2>

      {/* Search and Category Dropdown */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 w-1/2 p-2 rounded bg-darkbg border border-blueaccent text-lightgray focus:outline-none focus:ring-1 focus:ring-blueaccent"
        />
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded bg-darkbg border border-blueaccent text-lightgray w-40 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-blueaccent"
          >
            {categoryFilter ? getCategoryName(categoryFilter) : "All Categories"}
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
                  key={cat.id}
                  className={`p-2 cursor-pointer hover:bg-blueaccent hover:text-darkbg ${categoryFilter === cat.id ? "bg-blueaccent text-darkbg" : ""}`}
                  onClick={() => { setCategoryFilter(cat.id); setDropdownOpen(false); }}
                >
                  {cat.name}
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
      <div className="max-h-96 overflow-y-auto relative">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className={`relative flex flex-col md:flex-row justify-between items-start p-4 rounded-lg mb-2 shadow-md transition-transform hover:scale-105 ${getCategoryName(exp.categoryId).toLowerCase() === "income" ? "border-2 border-green-400" : "border-2 border-red-400"} bg-darkbg`}
            >
              {/* Delete Icon */}
              <button
                onClick={() => setDeleteId(exp.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete Expense"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-row items-center gap-2">
                <span className="font-bold text-lg">{getCategoryName(exp.categoryId)}</span>
                <span className={`text-md font-semibold ${getCategoryName(exp.categoryId).toLowerCase() === "income" ? "text-green-400" : "text-red-400"}`}>
                  ₹{exp.amount}
                </span>
              </div>

              {exp.note && <div className="mt-2 text-sm text-lightgray w-full md:mt-1">{exp.note}</div>}

              <div className="text-xs text-lightgray ml-auto">{exp.createdAt?.toDate().toLocaleDateString()}</div>
            </div>
          ))
        ) : (
          <p className="text-center text-lightgray mt-4">No expenses found</p>
        )}
      </div>

      {/* Custom Delete Confirmation Popup */}
      {deleteId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
          <div className="bg-darkblue rounded-lg p-6 w-80 shadow-lg flex flex-col gap-4">
            <h3 className="text-lg font-bold text-blueaccent">Confirm Delete</h3>
            <p className="text-lightgray">Are you sure you want to delete this expense?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-lightgray"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteExpense(deleteId)}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
