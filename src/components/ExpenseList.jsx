// src/components/ExpenseList.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function ExpenseList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "expenses"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Your Expenses</h2>
      {expenses.map((exp) => (
        <div key={exp.id} className="p-2 border-b">
          <p><b>{exp.category}</b> - ₹{exp.amount}</p>
          <small>{exp.note}</small>
        </div>
      ))}
    </div>
  );
}
