import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";

export default function Profile() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [deleteCatId, setDeleteCatId] = useState(null);

  const [banks, setBanks] = useState([]);
  const [deleteBankId, setDeleteBankId] = useState(null);
  const [bankWise, setbankWise] = useState(false);
  const [newBank, setNewBank] = useState("");

  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);

  // ✅ Fetch categories
  useEffect(() => {
    if (!user) return;
    const q = collection(db, "users", user.uid, "categories");
    const unsub = onSnapshot(q, (snap) => {
      setCategories(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((cat) => cat.name.toLowerCase() !== "income")
      );
    });
    return () => unsub();
  }, [user]);

  // ✅ Fetch bankWise flag
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setbankWise(snap.data().bankWise || false);
      }
    });
    return () => unsub();
  }, [user]);

  // ✅ Fetch banks (only if enabled)
  useEffect(() => {
    if (!user || !bankWise) return;
    const q = collection(db, "users", user.uid, "banks");
    const unsub = onSnapshot(q, (snap) => {
      setBanks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user, bankWise]);

  // ✅ Toggle Bank Feature
  const toggleBankFeature = async () => {
    await setDoc(
      doc(db, "users", user.uid),
      { bankWise: !bankWise },
      { merge: true }
    );
  };

  // ✅ Add Bank
  const addBank = async () => {
    if (!newBank.trim()) return;
    await addDoc(collection(db, "users", user.uid, "banks"), {
      name: newBank.trim(),
    });
    setNewBank("");
  };

  // ✅ Delete Category
  const deleteCategory = async (categoryId) => {
    await deleteDoc(doc(db, "users", user.uid, "categories", categoryId));
    setDeleteCatId(null);
  };

  // ✅ Delete Bank
  const deleteBank = async (bankId) => {
    await deleteDoc(doc(db, "users", user.uid, "banks", bankId));
    setDeleteBankId(null);
  };

  // ✅ Send Feedback (via EmailJS)
  const sendFeedback = async () => {
    if (!feedback.trim()) return;
    setSending(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAIL_SERVICE_ID,    // 🔹 replace with EmailJS service ID
        import.meta.env.VITE_EMAIL_TEMPELATE_ID,   // 🔹 replace with EmailJS template ID
        {
          from_email: user?.email,
          user_name: user?.email,
          from_name: user?.email,
          message: feedback,
          subject: `from+pennypilot+feedback`,
        },
        import.meta.env.VITE_EMAIL_KEY     // 🔹 replace with EmailJS public key
      );
      alert("✅ Feedback sent successfully!");
      setFeedback("");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send feedback.");
    }
    setSending(false);
  };

  return (
    <div className="p-6 space-y-6 relative">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-2">
        Home / <span className="text-blueaccent">Profile</span>
      </div>

      <h2 className="text-2xl font-bold text-blueaccent">Profile</h2>
      <p className="text-lightgray">Email: {user?.email}</p>
      <div className="flex items-center gap-3 mb-3">
            <span className="text-lightgray">Enable Bank Tracking</span>
            <button
              onClick={toggleBankFeature}
              className={`px-4 py-2 rounded ${
                bankWise ? "bg-green-600" : "bg-gray-900"
              }`}
            >
              {bankWise ? "ON" : "OFF"}
            </button>
          </div>

      {/* Categories + Banks side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <div>
          <h3 className="text-xl font-semibold mb-2 text-lightgray">
            Categories
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex justify-between items-center p-2 rounded-lg bg-darkbg border border-blueaccent"
              >
                <span>{cat.name}</span>
                <button
                  onClick={() => setDeleteCatId(cat.id)}
                  className="px-3 py-1 bg-red-900 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Banks */}
        <div>
          

          {bankWise && (
            <div>
              <h3 className="text-xl font-semibold mb-2 text-lightgray">
                Banks
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  placeholder="Add new bank"
                  className="flex-1 p-2 rounded bg-darkbg border border-blueaccent text-lightgray"
                />
                <button
                  onClick={addBank}
                  className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex justify-between items-center p-2 rounded-lg bg-darkbg border border-blueaccent"
                  >
                    <span>{bank.name}</span>
                    <button
                      onClick={() => setDeleteBankId(bank.id)}
                      className="px-3 py-1 bg-red-900 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2 text-lightgray">Feedback</h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write your feedback here..."
          className="w-full p-3 rounded bg-darkbg border border-blueaccent text-lightgray"
          rows={4}
        />
        <button
          onClick={sendFeedback}
          disabled={sending}
          className="mt-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {sending ? "Sending..." : "Submit Feedback"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={logout}
          className="bg-blue-900 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Category Delete Popup */}
      {deleteCatId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
          <div className="bg-darkblue rounded-lg p-6 w-80 shadow-lg flex flex-col gap-4">
            <h3 className="text-lg font-bold text-blueaccent">
              Confirm Delete
            </h3>
            <p className="text-lightgray">Delete this category?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteCatId(null)}
                className="px-4 py-2 bg-gray-600 rounded text-lightgray"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(deleteCatId)}
                className="px-4 py-2 bg-red-900 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Delete Popup */}
      {deleteBankId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
          <div className="bg-darkblue rounded-lg p-6 w-80 shadow-lg flex flex-col gap-4">
            <h3 className="text-lg font-bold text-blueaccent">
              Confirm Delete
            </h3>
            <p className="text-lightgray">Delete this bank?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteBankId(null)}
                className="px-4 py-2 bg-gray-600 rounded text-lightgray"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBank(deleteBankId)}
                className="px-4 py-2 bg-red-900 text-white rounded"
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
