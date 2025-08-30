// src/components/ExpenseList.js
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [bankEnabled, setBankEnabled] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [bankFilter, setBankFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const [deleteId, setDeleteId] = useState(null);

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

  // ✅ Fetch expenses
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "expenses"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExpenses(data);
      setFilteredExpenses(data);
    });
  }, [user]);

  // ✅ Fetch categories
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "categories"));
    return onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [user]);

  // ✅ Fetch bankEnabled + banks
  useEffect(() => {
    if (!user) return;
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setBankEnabled(snap.data()?.bankEnabled || false);
    });
    const q = query(collection(db, "users", user.uid, "banks"));
    const unsubBanks = onSnapshot(q, (snap) => {
      setBanks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubUser();
      unsubBanks();
    };
  }, [user]);

  // ✅ Helpers
  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "Unknown";
  const getBankName = (id) =>
    banks.find((b) => b.id === id)?.name || "No Bank";

  // ✅ Filters
  useEffect(() => {
    let temp = [...expenses];
    if (categoryFilter)
      temp = temp.filter((exp) => exp.categoryId === categoryFilter);
    if (bankFilter) temp = temp.filter((exp) => exp.bankId === bankFilter);
    if (dateFrom)
      temp = temp.filter((exp) => exp.createdAt?.toDate() >= new Date(dateFrom));
    if (dateTo)
      temp = temp.filter((exp) => exp.createdAt?.toDate() <= new Date(dateTo));
    if (search) {
      const lower = search.toLowerCase();
      temp = temp.filter(
        (exp) =>
          exp.note?.toLowerCase().includes(lower) ||
          getCategoryName(exp.categoryId)?.toLowerCase().includes(lower) ||
          (exp.bankId && getBankName(exp.bankId).toLowerCase().includes(lower))
      );
    }
    setFilteredExpenses(temp);
  }, [categoryFilter, bankFilter, search, dateFrom, dateTo, expenses, categories, banks]);

  // ✅ Delete expense
  const deleteExpense = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "expenses", id));
    setDeleteId(null);
  };

  return (
    <div className="md:h-[80vh] p-4 bg-darkblue rounded-lg shadow-md text-lightgray relative">
      <h2 className="text-lg font-bold mb-3 text-blueaccent">Your Expenses</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 rounded bg-darkbg border border-blueaccent"
        />
        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded bg-darkbg border border-blueaccent w-40 text-left flex justify-between items-center"
          >
            {categoryFilter ? getCategoryName(categoryFilter) : "All Categories"}
            <span className="ml-2">&#9662;</span>
          </button>
          {dropdownOpen && (
            <div className="absolute mt-1 w-full bg-darkbg border border-blueaccent rounded shadow-lg max-h-48 overflow-y-auto z-50">
              <div
                className="p-2 cursor-pointer hover:bg-blueaccent hover:text-darkbg"
                onClick={() => {
                  setCategoryFilter("");
                  setDropdownOpen(false);
                }}
              >
                All Categories
              </div>
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`p-2 cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-blueaccent text-darkbg"
                      : "hover:bg-blueaccent hover:text-darkbg"
                  }`}
                  onClick={() => {
                    setCategoryFilter(cat.id);
                    setDropdownOpen(false);
                  }}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bank Dropdown */}
        {bankEnabled && (
          <select
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            className="p-2 rounded bg-darkbg border border-blueaccent"
          >
            <option value="">All Banks</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Date Filters */}
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="p-2 rounded bg-darkbg border border-blueaccent"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="p-2 rounded bg-darkbg border border-blueaccent"
        />
      </div>

      {/* Expenses */}
      <div className="max-h-96 overflow-y-auto">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className={`relative flex flex-col md:flex-row justify-between items-start p-4 rounded-lg mb-2 shadow-md border-2 ${
                getCategoryName(exp.categoryId).toLowerCase() === "income"
                  ? "border-green-900"
                  : "border-red-900"
              } bg-darkbg`}
            >
              {/* Delete Btn */}
              <button
                onClick={() => setDeleteId(exp.id)}
                className="absolute top-1 right-1 text-red-500 hover:text-red-700 bg-[rgba(0,0,0,0.5)] p-2 rounded-full"
              >
                ✕
              </button>

              <div className="flex flex-col gap-1">
                <span className="font-bold text-lg">
                  {getCategoryName(exp.categoryId)}
                </span>
                {bankEnabled && exp.bankId && (
                  <span className="text-sm text-blue-400">
                    Bank: {getBankName(exp.bankId)}
                  </span>
                )}
              </div>

              <span
                className={`font-semibold ${
                  getCategoryName(exp.categoryId).toLowerCase() === "income"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ₹{exp.amount}
              </span>

              {exp.note && (
                <div className="mt-2 text-sm text-lightgray">{exp.note}</div>
              )}

              <div className="text-xs text-lightgray ml-auto">
                {exp.createdAt?.toDate().toLocaleDateString()}
              </div>
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
