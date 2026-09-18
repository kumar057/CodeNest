"use client";
import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; text: string };
const topics = [[
  "🐍","Python","Teach me Python from beginner level"],["🗄️","SQL","Teach me SQL with simple examples"],
  ["☕","Java","Start Java for a beginner"],["🌐","JavaScript","Teach me JavaScript step by step"],
  ["🎨","HTML & CSS","Teach me HTML and CSS"],["🤖","AI / ML","Explain AI and machine learning simply"]
];
const welcome: Message = { role: "assistant", text: "Hi! I’m CodeNest. 👋\n\nI’m your coding tutor. Ask me anything, or choose a topic below. I’ll explain it simply, give examples, and help you practice one question at a time." };

export default function Home() {
 const [messages,setMessages]=useState<Message[]>([welcome]); const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [course,setCourse]=useState("General");
 async function send(value=input){ const text=value.trim(); if(!text||loading)return; const next=[...messages,{role:"user" as const,text}]; setMessages(next); setInput(""); setLoading(true);
  try { const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({course,messages:next.map(m=>({role:m.role,content:m.text}))})}); const d=await r.json(); setMessages(cur=>[...cur,{role:"assistant",text:d.message||d.error||"I could not generate a response."}]); }
  catch { setMessages(cur=>[...cur,{role:"assistant",text:"I could not connect to the AI service. Check the Gemini API configuration in Vercel."}]); } finally {setLoading(false);} }
 function submit(e:FormEvent){e.preventDefault();void send();}
 function reset(){setMessages([welcome]);setInput("");setCourse("General");}
 return <div className="app">
  <aside className="sidebar"><div className="brand"><span className="brand-mark">⌘</span>CodeNest</div><button className="new-chat" onClick={reset}>＋ New chat</button>
   <div className="side-label">Chats</div><button className="chat-item active">◌ New learning chat</button>
   <div className="side-label">Learn</div>{topics.map(([icon,name,prompt])=><button className="side-course" key={name} onClick={()=>{setCourse(name);void send(prompt)}}><span>{icon}</span><span>{name}</span></button>)}
   <div className="sidebar-footer">AI coding tutor<br/>Learn by conversation</div></aside>
  <main className="chat-shell"><header className="chat-header"><div className="mobile-brand"><span className="brand-mark">⌘</span>CodeNest</div><div className="model-picker"><span className="status-dot"/>CodeNest Tutor⌄</div><button className="header-action" onClick={reset}>＋ New chat</button></header>
   <section className="conversation"><div className="conversation-inner">
    {messages.map((m,i)=><div className={m.role==="assistant"?"row assistant-row":"row user-row"} key={i}><div className={m.role==="assistant"?"avatar assistant-avatar":"avatar user-avatar"}>{m.role==="assistant"?"⌘":"You"}</div><div className="message-wrap"><div className="message-name">{m.role==="assistant"?"CodeNest":"You"}</div><div className={m.role==="assistant"?"bubble assistant-bubble":"bubble user-bubble"}>{m.text.split("\n").map((line,j)=><span key={j}>{line}{j<m.text.split("\n").length-1&&<br/>}</span>)}</div>{m.role==="assistant"&&i>0&&<div className="message-tools"><button onClick={()=>navigator.clipboard?.writeText(m.text)}>Copy</button><button onClick={()=>void send("Explain your previous answer in simpler words")}>Explain simpler</button><button onClick={()=>void send("Give me one practice question based on this")}>Practice</button></div>}</div></div>)}
    {loading&&<div className="row assistant-row"><div className="avatar assistant-avatar">⌘</div><div className="message-wrap"><div className="message-name">CodeNest</div><div className="bubble assistant-bubble typing"><i/><i/><i/></div></div></div>}
    {messages.length===1&&!loading&&<div className="starter"><div className="starter-title">What do you want to learn?</div><div className="starter-grid">{topics.map(([icon,name,prompt])=><button key={name} onClick={()=>{setCourse(name);void send(prompt)}}><span>{icon}</span><div><strong>{name}</strong><small>{prompt}</small></div><b>→</b></button>)}</div></div>}
   </div></section>
   <div className="composer-area"><form className="composer" onSubmit={submit}><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();void send()}}} placeholder={course==="General"?"Message CodeNest…":"Ask about "+course+"…"} rows={1} disabled={loading}/><div className="composer-footer"><span>Shift + Enter for a new line · Learn by asking questions</span><button className="send-button" disabled={loading||!input.trim()}>↑</button></div></form><div className="footer-note">CodeNest can make mistakes. Check important code before using it.</div></div>
  </main></div>;
}