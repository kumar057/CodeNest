"use client";

import { useState } from "react";

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
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm CodeNest AI. Choose a course or ask me anything about programming." },
  ]);

  function send() {
    const value = message.trim();
    if (!value) return;
    setMessages((m) => [...m, { role: "user", text: value }, { role: "ai", text: "Great question! AI tutor integration is ready for the next step. Soon I’ll explain concepts, give hints, and check your practice answers." }]);
    setMessage("");
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
        <header className="topbar"><strong>AI Coding Tutor</strong><span className="badge">Learning mode</span></header>
        <section className="content">
          <div className="hero">
            <h1>Learn to code with <span className="accent">CodeNest AI.</span></h1>
            <p>A small, focused learning platform where you can learn programming through conversation, practice problems, hints, and simple explanations.</p>
          </div>

          <div className="courses">
            {courses.map((course) => (
              <button className="course" key={course.name} onClick={() => setMessage(`Teach me ${course.name} from beginner level`)}>
                <div className="icon">{course.icon}</div>
                <h3>{course.name}</h3>
                <p>{course.text}</p>
              </button>
            ))}
          </div>

          <section className="chat">
            <div className="chat-head"><strong>CodeNest AI Tutor</strong><span className="badge">Online</span></div>
            <div className="messages">
              {messages.map((item, i) => <div key={i} className={`message ${item.role}`}>{item.text}</div>)}
            </div>
            <div className="input-row">
              <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask: Explain Python loops simply..." />
              <button className="send" onClick={send}>Send</button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
