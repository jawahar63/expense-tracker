// src/components/ExpenseForm.js
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  onSnapshot,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Fetch categories from Firebase
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((doc) => doc.data().name));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Login first!");
    if (!amount || !category) return alert("Amount and Category are required!");

    try {
      await addDoc(collection(db, "expenses"), {
        uid: user.uid,
        amount: parseFloat(amount),
        category,
        note,
        createdAt: serverTimestamp(),
      });
      setAmount("");
      setCategory("");
      setNote("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (!categories.includes(trimmed)) {
      try {
        // Save new category in Firestore
        await setDoc(doc(db, "categories", trimmed), { name: trimmed });
        setCategory(trimmed);
        setShowPopup(false);
        setNewCategory("");
      } catch (error) {
        alert(error.message);
      }
    } else {
      setCategory(trimmed);
      setShowPopup(false);
      setNewCategory("");
    }
  };

  return (
    <div className="bg-darkblue p-4 rounded-lg shadow-md mb-4 text-lightgray">
      <h3 className="text-lg font-bold mb-2 text-blueaccent">Add Expense</h3>

      {/* Categories as breadcrumbs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full border ${
              category === cat
                ? "bg-blueaccent text-darkbg"
                : "bg-darkbg border-blueaccent text-lightgray"
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowPopup(true)}
          className="px-3 py-1 rounded-full border bg-blueaccent text-darkbg font-bold"
        >
          +
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Amount"
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blueaccent bg-darkbg text-lightgray"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Category"
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blueaccent bg-darkbg text-lightgray"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />

        <textarea
          placeholder="Note"
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blueaccent bg-darkbg text-lightgray"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
        />

        <button
          type="submit"
          className="bg-blueaccent text-darkbg p-2 rounded hover:bg-lightgray hover:text-darkblue transition"
        >
          Add
        </button>
      </form>

      {/* Popup for new category */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-darkblue p-4 rounded-lg shadow-md w-80 text-lightgray">
            <h4 className="text-lg font-bold mb-2 text-blueaccent">Add New Category</h4>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blueaccent bg-darkbg text-lightgray"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="px-3 py-1 border rounded hover:bg-darkbg/80"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-3 py-1 bg-blueaccent text-darkbg rounded hover:bg-lightgray hover:text-darkblue"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
