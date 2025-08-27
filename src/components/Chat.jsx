// src/components/Chat.js
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addDoc(collection(db, "messages"), {
      uid: user.uid,
      displayName: user.email,
      text,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="p-4 border rounded max-h-96 overflow-y-auto">
      <h2 className="font-bold mb-2">Chat</h2>
      <div className="flex flex-col gap-2 mb-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 rounded ${msg.uid === user.uid ? "bg-blue-200 self-end" : "bg-gray-200 self-start"}`}>
            <b>{msg.displayName}</b>: {msg.text}
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </form>
    </div>
  );
}
