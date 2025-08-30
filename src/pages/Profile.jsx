import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function Profile() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [deleteCatId, setDeleteCatId] = useState(null); // ✅ for delete confirmation

  // Fetch categories
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "categories"),
      orderBy("name", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      // ✅ Filter out "Income"
      setCategories(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((cat) => cat.name.toLowerCase() !== "income")
      );
    });
    return () => unsub();
  }, [user]);

  // Fetch expenses
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "expenses"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // Delete Category
  const deleteCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "categories", categoryId));
      setDeleteCatId(null); // close popup
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Delete Profile
  const deleteProfile = async () => {
    try {
      const catSnapshot = await getDocs(
        collection(db, "users", user.uid, "categories")
      );
      for (let docSnap of catSnapshot.docs) {
        await deleteDoc(doc(db, "users", user.uid, "categories", docSnap.id));
      }

      const expSnapshot = await getDocs(
        collection(db, "users", user.uid, "expenses")
      );
      for (let docSnap of expSnapshot.docs) {
        await deleteDoc(doc(db, "users", user.uid, "expenses", docSnap.id));
      }

      await deleteDoc(doc(db, "users", user.uid));
      await user.delete();
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-2">
        Home / <span className="text-blueaccent">Profile</span>
      </div>

      <h2 className="text-2xl font-bold text-blueaccent">Profile</h2>
      <p className="text-lightgray">Email: {user?.email}</p>

      {/* Categories List */}
      <div>
        <h3 className="text-xl font-semibold mb-2 text-lightgray">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex justify-between items-center p-2 rounded-lg bg-darkbg border border-blueaccent"
            >
              <span>{cat.name}</span>
              <button
                onClick={() => setDeleteCatId(cat.id)} // ✅ trigger popup
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={logout}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
        <button
          onClick={deleteProfile}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Delete Profile
        </button>
      </div>

      {/* ✅ Delete Confirmation Popup */}
      {deleteCatId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
          <div className="bg-darkblue rounded-lg p-6 w-80 shadow-lg flex flex-col gap-4">
            <h3 className="text-lg font-bold text-blueaccent">Confirm Delete</h3>
            <p className="text-lightgray">
              Are you sure you want to delete this category?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteCatId(null)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-lightgray"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(deleteCatId)}
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
