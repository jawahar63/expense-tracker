// src/components/ExpenseForm.js
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseForm() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Login first!");

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

  return (
    <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
      <input
        type="number"
        placeholder="Amount"
        className="border p-2 rounded"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Category (e.g., Food, Travel)"
        className="border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Note"
        className="border p-2 rounded"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button type="submit" className="bg-green-500 text-white py-2 rounded">
        Add Expense
      </button>
    </form>
  );
}
