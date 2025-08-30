import { useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const defaultCategories = ["Income", "Food", "Travel", "Hospital"];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const createDefaultCategories = async (uid) => {
    const catRef = collection(db, "users", uid, "categories");
    for (let name of defaultCategories) {
      await addDoc(catRef, { name });
    }
  };

  const createUserProfile = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      });
      await createDefaultCategories(user.uid);
      console.log("✅ User created with default categories");
    } else {
      console.log("ℹ️ Existing user " + user.uid);
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email.");
      return false;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // 🔹 Block login if not verified
        if (!userCredential.user.emailVerified) {
          alert("Please verify your email before logging in.");
          await signOut(auth);
          return;
        }

        console.log("✅ Logged in successfully");
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        // 🔹 Send verification mail
        await sendEmailVerification(user);

        // Create profile in Firestore
        await createUserProfile(user);

        alert(
          "📧 Verification email sent! Please check your inbox before logging in."
        );
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // 🔹 Google accounts are already verified
      await createUserProfile(result.user);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#010C16]">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-[#022040] text-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#6EACDA]">
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg border border-[#6EACDA] bg-[#010C16] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6EACDA]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg border border-[#6EACDA] bg-[#010C16] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6EACDA]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full p-3 mb-4 rounded-lg font-semibold bg-[#6EACDA] text-[#010C16] hover:bg-[#E2E2B6] hover:text-[#022040] transition disabled:opacity-50"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full p-3 mb-4 rounded-lg border border-[#6EACDA] flex items-center justify-center gap-2 text-[#6EACDA] hover:bg-[#010C16] transition disabled:opacity-50"
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-[#E2E2B6]">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-[#6EACDA] font-semibold cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
