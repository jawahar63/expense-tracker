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
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(""); // store ID
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState([]); // [{id, name}]
  const [showPopup, setShowPopup] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // ✅ Fetch user's categories
  useEffect(() => {
    if (!user) return;
    const categoriesRef = collection(db, "users", user.uid, "categories");
    const q = query(categoriesRef, orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Login first!");
    if (!amount || !categoryId) return alert("Amount and Category are required!");

    try {
      // ✅ also fetch category name to store with expense
      const categoryDoc = await getDoc(
        doc(db, "users", user.uid, "categories", categoryId)
      );
      const categoryName = categoryDoc.exists() ? categoryDoc.data().name : "";

      const expensesRef = collection(db, "users", user.uid, "expenses");
      await addDoc(expensesRef, {
        amount: parseFloat(amount),
        categoryId,
        category: categoryName, // ✅ store name too
        note,
        createdAt: serverTimestamp(),
      });

      setAmount("");
      setCategoryId("");
      setNote("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed || !user) return;

    // Check if category already exists
    const exists = categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      try {
        const categoryRef = doc(collection(db, "users", user.uid, "categories"));
        await setDoc(categoryRef, { name: trimmed });
        setCategoryId(categoryRef.id); // select new
        setShowPopup(false);
        setNewCategory("");
      } catch (error) {
        alert(error.message);
      }
    } else {
      setCategoryId(exists.id);
      setShowPopup(false);
      setNewCategory("");
    }
  };

  return (
    <div className="bg-darkblue p-4 rounded-lg shadow-md mb-4 text-lightgray">
      <h3 className="text-lg font-bold mb-2 text-blueaccent">Add Expense</h3>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`px-3 py-1 rounded-full border ${
              categoryId === cat.id
                ? "bg-blueaccent text-darkbg"
                : "bg-darkbg border-blueaccent text-lightgray"
            }`}
          >
            {cat.name}
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

      {/* Expense form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Amount"
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blueaccent bg-darkbg text-lightgray"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
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
