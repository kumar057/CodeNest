"use client";

import { useState } from "react";

type Message = { role: "user" | "ai"; text: string };

const courses = [
  { icon: "🐍", name: "Python", text: "Programming fundamentals, functions, loops and problem solving." },
  { icon: "🗄️", name: "SQL / MySQL", text: "Queries, filtering, joins, grouping and database design." },
  { icon: "☕", name: "Java", text: "Core Java, OOP, collections and practical coding." },
  { icon: "🌐", name: "JavaScript", text: "Modern JavaScript, DOM, async code and web basics." },
  { icon: "🎨", name: "HTML & CSS", text: "Build responsive pages and understand the web platform." },
  { icon: "🤖", name: "AI / ML", text: "Start with machine learning concepts and practical Python." },
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I'm CodeNest AI. Choose a course or ask me anything about programming." },
  ]);

  async function send() {
    const value = message.trim();
    if (!value || loading) return;
    const next = [...messages, { role: "user" as const, text: value }];
    setMessages(next);
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "ai", text: data.message || data.error || "Something went wrong." }]);
    } catch {
      setMessages((current) => [...current, { role: "ai", text: "I couldn't reach the AI service. Please check the server configuration." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="logo">⌘</span> CodeNest</div>
        <div className="nav-title">Learning</div>
        <button className="nav active">💬 AI Tutor</button>
        <button className="nav">📚 Courses</button>
        <button className="nav">📝 Practice</button>
        <button className="nav">🏆 Progress</button>
        <div className="nav-title">Workspace</div>
        <button className="nav">🗂️ My Chats</button>
        <button className="nav">⚙️ Settings</button>
      </aside>
      <main className="main">
        <header className="topbar"><strong>AI Coding Tutor</strong><span className="badge">{loading ? "Thinking..." : "Online"}</span></header>
        <section className="content">
          <div className="hero">
            <h1>Learn to code with <span className="accent">CodeNest AI.</span></h1>
            <p>A focused learning platform where you learn programming through conversation, practice problems, hints, and simple explanations.</p>
          </div>
          <div className="courses">
            {courses.map((course) => (
              <button className="course" key={course.name} onClick={() => setMessage(`Teach me ${course.name} from beginner level`)}>
                <div className="icon">{course.icon}</div><h3>{course.name}</h3><p>{course.text}</p>
              </button>
            ))}
          </div>
          <section className="chat">
            <div className="chat-head"><strong>CodeNest AI Tutor</strong><span className="badge">Tutor</span></div>
            <div className="messages">
              {messages.map((item, i) => <div key={i} className={`message ${item.role}`}>{item.text}</div>)}
              {loading && <div className="message ai">Thinking...</div>}
            </div>
            <div className="input-row">
              <input value={message} disabled={loading} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask: Explain Python loops simply..." />
              <button className="send" disabled={loading} onClick={send}>{loading ? "..." : "Send"}</button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
