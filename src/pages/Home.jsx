import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "expenses"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter entries for the current month
      const currentMonth = new Date().getMonth();
      const monthEntries = data.filter((d) => {
        const date = d.createdAt?.toDate();
        return date && date.getMonth() === currentMonth;
      });

      setEntries(monthEntries);

      // Calculate income and expense for this month
      let totalIncome = 0;
      let totalExpense = 0;
      monthEntries.forEach((d) => {
        if (d.category.toLowerCase() === "income") totalIncome += d.amount;
        else totalExpense += d.amount;
      });
      setIncome(totalIncome);
      setExpense(totalExpense);
    });

    return () => unsubscribe();
  }, [user]);

  const balance = income - expense;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Balance */}
      <div className="p-6 bg-darkbg rounded-lg shadow-md text-center">
        <div className="text-sm text-lightgray">Balance</div>
        <div className="text-4xl font-bold text-blueaccent">₹{balance}</div>
      </div>

      {/* Income & Expense */}
      <div className="p-4 bg-darkbg rounded-lg shadow-md flex justify-around text-center">
        <div>
          <div className="text-sm">Income</div>
          <div className="text-lg font-bold text-green-400">₹{income}</div>
        </div>
        <div>
          <div className="text-sm">Expense</div>
          <div className="text-lg font-bold text-red-400">₹{expense}</div>
        </div>
      </div>

      {/* This Month's Entries */}
      <div className="p-4 bg-darkbg rounded-lg shadow-md">
        <h3 className="font-bold mb-2">This Month's Entries</h3>
        {entries.length === 0 && (
          <p className="text-lightgray">No entries for this month.</p>
        )}
        {entries.map((exp) => (
          <div
            key={exp.id}
            className="p-2 border-b border-blueaccent flex justify-between items-center"
          >
            <div>
              <p><b>{exp.category}</b> - ₹{exp.amount}</p>
              <small>{exp.note}</small>
            </div>
            <div className="text-sm">
              {exp.createdAt?.toDate().toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
