import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

const TEACHER_PASSWORD = "Docente2024";

const SYSTEM_PROMPT = `You are an academic writing assistant designed to help B2-B2+ English level students write a formal, informative essay on school coexistence. Your role is strictly to guide, review, and give feedback — you never write the essay for the student.

STUDENT LEVEL: B2 to B2+ (Upper-Intermediate to Advanced)
- Use clear, accessible academic language. Avoid overly complex vocabulary, but challenge students appropriately.
- Explain grammar concepts in simple terms with clear examples.
- Be patient and encouraging.

ESSAY REQUIREMENTS:
Topic: School coexistence (convivencia escolar)
Length: approximately 350 words
Structure: Introduction → Body paragraphs → Conclusion
Tone: Formal, neutral, and academic
Language: English only

EVALUATION CRITERIA:
1. TASK ACHIEVEMENT – objective, informative, key terms defined, ideas supported with evidence
2. COHERENCE & COHESION – logical flow, cohesive devices (furthermore, however, in addition, therefore...)
3. USE OF LANGUAGE – formal vocabulary, grammatical accuracy, sentence variety
4. PUNCTUATION & CAPITALIZATION – no run-ons, correct commas/periods, proper capitalization

GRAMMAR TO TEACH: relative clauses, passive voice, transitional phrases, cohesive devices.

HOW TO BEHAVE:
- Always respond in English
- Be encouraging but honest
- Explain WHY errors are wrong and HOW to fix them
- Ask guiding questions instead of giving answers
- Give structured feedback: Task Achievement → Coherence → Language → Grammar → Punctuation
- Never write full paragraphs for the student
- Use bullet points for feedback`;

const navy = "#1a2744";
const navyMid = "#2d3f6e";
const blue = "#4f7af8";
const lightBlue = "#7c9fff";
const bgGrad = "linear-gradient(135deg, #f8f9ff 0%, #eef1fb 100%)";

const suggestions = [
  "Check my introduction",
  "Check my paragraph",
  "Check my conclusion",
  "Check my complete essay",
];

function sessionKey(id) { return `session:${id}`; }

function formatMsg(text) {
  return text.split("\n").map((line, i, arr) => {
    const html = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code style='background:#f0f4ff;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:0.88em'>$1</code>");
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function Avatar({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${blue}, ${lightBlue})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.44, flexShrink: 0,
    }}>✏️</div>
  );
}

function Header({ student, onTeacher }) {
  return (
    <div style={{
      background: navy, color: "white", padding: "16px 24px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 2px 12px rgba(0,0,0,0.15)", flexShrink: 0,
    }}>
      <div style={{
        width: 42, height: 42, background: `linear-gradient(135deg,${blue},${lightBlue})`,
        borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>✏️</div>
      <div>
        <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>Essay Writing Assistant</div>
        <div style={{ fontSize: "0.78rem", opacity: 0.7, fontFamily: "sans-serif", marginTop: 2 }}>
          School Coexistence · B2–B2+ English
          {student && ` · ${student.name} (${student.section})`}
        </div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ background: navyMid, borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", fontFamily: "sans-serif", color: "#a8c4ff" }}>~350 words</div>
        <button onClick={onTeacher} style={{
          background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 20, padding: "4px 12px", color: "rgba(255,255,255,0.7)",
          fontSize: "0.72rem", fontFamily: "sans-serif", cursor: "pointer",
        }}>👩‍🏫 Docente</button>
      </div>
    </div>
  );
}

function StudentLogin({ onStart }) {
  const [name, setName]       = useState("");
  const [section, setSection] = useState("");
  const [email, setEmail]     = useState("");

  const valid = name.trim() && section.trim() && email.trim() && email.includes("@");

  const fields = [
    { label: "Full name",  value: name,    set: setName,    placeholder: "e.g. María González",  type: "text" },
    { label: "Section",    value: section, set: setSection, placeholder: "e.g. 4° Medio A",      type: "text" },
    { label: "Email",      value: email,   set: setEmail,   placeholder: "e.g. maria@gmail.com", type: "email" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 420, width: "100%", border: "1px solid #e8ecf8" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✏️</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: navy, fontFamily: "Georgia,serif" }}>Welcome!</div>
          <div style={{ fontSize: "0.88rem", color: "#7a8aaa", fontFamily: "sans-serif", marginTop: 6 }}>Please identify yourself before starting</div>
        </div>
        {fields.map(({ label, value, set, placeholder, type }) => (
          <div key={label} style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontFamily: "sans-serif", color: "#5a6a8a", marginBottom: 6, fontWeight: 600 }}>{label}</label>
            <input
              type={type} value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              onKeyDown={e => e.key === "Enter" && valid && onStart({ name: name.trim(), section: section.trim(), email: email.trim() })}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d0d8f0", borderRadius: 10, fontSize: "0.92rem", fontFamily: "Georgia,serif", color: navy, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = blue}
              onBlur={e => e.target.style.borderColor = "#d0d8f0"}
            />
          </div>
        ))}
        <div style={{ fontSize: "0.75rem", color: "#7a8aaa", fontFamily: "sans-serif", marginBottom: 16 }}>
          📧 Your email will be saved for your teacher's records.
        </div>
        <button onClick={() => valid && onStart({ name: name.trim(), section: section.trim(), email: email.trim() })} disabled={!valid} style={{
          width: "100%", padding: 13,
          background: valid ? `linear-gradient(135deg,${navy},${navyMid})` : "#e8ecf8",
          color: valid ? "white" : "#aab",
          border: "none", borderRadius: 12, fontSize: "0.95rem",
          fontFamily: "sans-serif", fontWeight: 600,
          cursor: valid ? "pointer" : "not-allowed",
        }}>Start writing →</button>
      </div>
    </div>
  );
}

function Chat({ student, sessionId }) {
  const initMsg = {
    role: "assistant",
    content: `Hello, ${student.name}! 👋 I'm your academic writing assistant.\n\nI'm here to help you write a well-structured, formal informative essay on **school coexistence** in English. You can:\n\n• **Paste your draft** and I'll give you detailed feedback\n• **Ask grammar questions** (passive voice, relative clauses, etc.)\n• **Get help with structure** — intro, body, and conclusion\n• **Check your vocabulary** and academic tone\n\nWhat would you like to work on today?`,
    ts: new Date().toISOString(),
  };

  const [messages, setMessages] = useState([initMsg]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef(null);

  // word count
  const words      = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
  const target     = 350;
  const pct        = Math.min(words / target, 1);
  const barColor   = words === 0 ? "#e8ecf8" : words < 250 ? "#f0a500" : words <= 420 ? "#2a9d6e" : "#e05252";
  const barLabel   = words < 250 ? "Keep writing! 💪" : words <= 420 ? "Great length! ✅" : "A bit long — consider trimming ✂️";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    const save = async () => {
      try {
        await window.storage.set(sessionKey(sessionId), JSON.stringify({
          sessionId, student,
          startTime: messages[0]?.ts,
          lastTime: messages[messages.length - 1]?.ts,
          messages,
        }), true);
      } catch {}
    };
    save();
  }, [messages]);

  const [image, setImage] = useState(null); // { base64, mediaType, preview }
  const fileRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setImage({ base64, mediaType: file.type, preview: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const send = async (text) => {
    const userText = text || input.trim();
    if ((!userText && !image) || loading) return;

    // Build display message
    const displayContent = userText || "📷 Handwritten paragraph (image)";
    const userMsg = { role: "user", content: displayContent, ts: new Date().toISOString(), image: image?.preview };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    const sentImage = image;
    setImage(null);
    setLoading(true);

    try {
      // Build API messages — include image if present
      const apiMessages = newMsgs.map((m, i) => {
        if (i === newMsgs.length - 1 && sentImage) {
          const content = [];
          if (userText) content.push({ type: "text", text: userText });
          content.push({ type: "text", text: "Please read my handwritten paragraph in this image, transcribe it, and give me feedback on it." });
          content.push({ type: "image", source: { type: "base64", media_type: sentImage.mediaType, data: sentImage.base64 } });
          return { role: "user", content };
        }
        return { role: m.role, content: m.content };
      });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't generate a response.";
      setMessages([...newMsgs, { role: "assistant", content: reply, ts: new Date().toISOString() }]);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Something went wrong. Please try again.", ts: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 780, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: 10 }}>
            {msg.role === "assistant" && <Avatar />}
            <div style={{
              maxWidth: "78%",
              background: msg.role === "user" ? `linear-gradient(135deg,${navy},${navyMid})` : "white",
              color: msg.role === "user" ? "white" : navy,
              padding: "13px 17px",
              borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
              fontSize: "0.92rem", lineHeight: 1.65,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              border: msg.role === "assistant" ? "1px solid #e8ecf8" : "none",
            }}>
              {msg.image && (
                <img src={msg.image} alt="handwritten" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 8, display: "block" }} />
              )}
              {formatMsg(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar />
            <div style={{ background: "white", border: "1px solid #e8ecf8", borderRadius: "4px 18px 18px 18px", padding: "13px 17px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: "50%", background: blue, animation: "bounce 1.2s infinite", animationDelay: `${n*0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 20px 12px", maxWidth: 780, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          <div style={{ fontSize: "0.75rem", color: "#7a8aaa", fontFamily: "sans-serif", marginBottom: 8, letterSpacing: "0.5px" }}>QUICK START</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{ background: "white", border: "1px solid #d0d8f0", borderRadius: 20, padding: "7px 14px", fontSize: "0.82rem", color: navy, cursor: "pointer", fontFamily: "sans-serif" }}
                onMouseOver={e => e.currentTarget.style.borderColor = blue}
                onMouseOut={e => e.currentTarget.style.borderColor = "#d0d8f0"}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: "14px 20px 20px", maxWidth: 780, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Word count bar */}
        {words > 0 && (
          <div style={{ marginBottom: 10, background: "white", border: "1px solid #e8ecf8", borderRadius: 12, padding: "10px 14px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: "0.78rem", fontFamily: "sans-serif", color: barColor, fontWeight: 700 }}>
                {words} word{words !== 1 ? "s" : ""}
              </span>
              <span style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: "#aab" }}>Target: {target} words</span>
            </div>
            <div style={{ height: 6, background: "#e8ecf8", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct * 100}%`, background: barColor, borderRadius: 10, transition: "width 0.15s, background 0.3s" }} />
            </div>
            <div style={{ fontSize: "0.7rem", fontFamily: "sans-serif", color: "#aab", marginTop: 4 }}>{barLabel}</div>
          </div>
        )}

        {/* Image preview */}
        {image && (
          <div style={{ marginBottom: 10, position: "relative", display: "inline-block" }}>
            <img src={image.preview} alt="preview" style={{ maxHeight: 120, borderRadius: 10, border: "1.5px solid #d0d8f0", display: "block" }} />
            <button onClick={() => setImage(null)} style={{
              position: "absolute", top: -8, right: -8,
              background: "#e05252", color: "white", border: "none",
              borderRadius: "50%", width: 22, height: 22, fontSize: "0.75rem",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        )}

        <div style={{ display: "flex", background: "white", border: "1.5px solid #d0d8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Hidden file input */}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />

          {/* Image upload button */}
          <button onClick={() => fileRef.current.click()} title="Upload handwritten paragraph" style={{
            background: "transparent", border: "none", borderRight: "1px solid #e8ecf8",
            padding: "0 14px", cursor: "pointer", fontSize: "1.2rem", color: image ? blue : "#aab",
            transition: "color 0.2s",
          }}>📷</button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type your question, paste your draft, or upload a photo 📷"
            rows={3}
            style={{ flex: 1, border: "none", outline: "none", padding: "14px 16px", fontSize: "0.92rem", fontFamily: "Georgia,serif", resize: "none", color: navy, lineHeight: 1.55, background: "transparent" }}
          />
          <button onClick={() => send()} disabled={(!input.trim() && !image) || loading} style={{
            background: (input.trim() || image) && !loading ? `linear-gradient(135deg,${navy},${navyMid})` : "#e8ecf8",
            color: (input.trim() || image) && !loading ? "white" : "#aab",
            border: "none", padding: "0 22px",
            cursor: (input.trim() || image) && !loading ? "pointer" : "not-allowed",
            fontSize: "1.2rem", transition: "all 0.2s", borderLeft: "1px solid #e8ecf8",
          }}>→</button>
        </div>
        <div style={{ textAlign: "center", fontSize: "0.72rem", color: "#aab", fontFamily: "sans-serif", marginTop: 8 }}>
          Press Enter to send · Shift+Enter for new line
        </div>
      </div>
    </>
  );
}

function TeacherLogin({ onLogin, onBack }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);
  const handle = () => { if (pwd === TEACHER_PASSWORD) onLogin(); else { setErr(true); setPwd(""); } };
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 380, width: "100%", border: "1px solid #e8ecf8" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👩‍🏫</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: navy, fontFamily: "Georgia,serif" }}>Teacher Access</div>
          <div style={{ fontSize: "0.85rem", color: "#7a8aaa", fontFamily: "sans-serif", marginTop: 6 }}>Enter your password to view student reports</div>
        </div>
        <input type="password" value={pwd} onChange={e => { setPwd(e.target.value); setErr(false); }} onKeyDown={e => e.key === "Enter" && handle()} placeholder="Password"
          style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${err ? "#e05252" : "#d0d8f0"}`, borderRadius: 10, fontSize: "0.92rem", fontFamily: "sans-serif", color: navy, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
        {err && <div style={{ color: "#e05252", fontSize: "0.8rem", fontFamily: "sans-serif", marginBottom: 10 }}>Incorrect password. Try again.</div>}
        <button onClick={handle} style={{ width: "100%", padding: 13, background: `linear-gradient(135deg,${navy},${navyMid})`, color: "white", border: "none", borderRadius: 12, fontSize: "0.95rem", fontFamily: "sans-serif", fontWeight: 600, cursor: "pointer", marginTop: 4 }}>Enter →</button>
        <button onClick={onBack} style={{ width: "100%", padding: 10, background: "transparent", color: "#7a8aaa", border: "none", borderRadius: 12, fontSize: "0.85rem", fontFamily: "sans-serif", cursor: "pointer", marginTop: 8 }}>← Back</button>
      </div>
    </div>
  );
}

function TeacherDashboard({ onBack }) {
  const [sessions, setSessions]     = useState([]);
  const [loadingData, setLoading]   = useState(true);
  const [selected, setSelected]     = useState(null);
  const [exporting, setExporting]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const keys = await window.storage.list("session:", true);
        const all = await Promise.all((keys?.keys || []).map(async k => {
          try { const r = await window.storage.get(k, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
        }));
        setSessions(all.filter(Boolean).sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime)));
      } catch { setSessions([]); }
      setLoading(false);
    };
    load();
  }, []);

  const analyzeSession = async (s) => {
    const transcript = s.messages
      .filter(m => !m.content.startsWith("Hello,"))
      .map(m => `[${m.role === "user" ? "Student" : "Assistant"}]: ${m.content}`)
      .join("\n\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: `You are an educational analyst. Based on a tutoring conversation, extract two things in JSON format only, no markdown:
{
  "difficulties": "Brief list of the main writing difficulties or errors identified in the student's work (max 3, comma-separated)",
  "learned": "Brief list of skills or concepts the student showed progress on or already mastered (max 3, comma-separated)"
}
If there is not enough information, write "Not enough data" in each field.`,
          messages: [{ role: "user", content: transcript }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return { difficulties: "Could not analyze", learned: "Could not analyze" };
    }
  };

  const downloadExcel = async () => {
    setExporting(true);
    const rows = [];

    for (const s of sessions) {
      const date = s.startTime ? new Date(s.startTime).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

      // Pair student messages with the next assistant response
      const msgs = s.messages.filter(m => !m.content.startsWith("Hello,"));
      const pairs = [];
      for (let i = 0; i < msgs.length; i++) {
        if (msgs[i].role === "user") {
          const feedback = msgs[i + 1]?.role === "assistant" ? msgs[i + 1].content : "—";
          pairs.push({ student: msgs[i].content, feedback });
        }
      }

      // AI analysis of the full session
      const analysis = await analyzeSession(s);

      pairs.forEach((p, idx) => {
        rows.push({
          "Student Name":       s.student.name,
          "Section":            s.student.section,
          "Date":               date,
          "Student Message":    p.student,
          "Assistant Feedback": p.feedback,
          "Main Difficulties":  idx === 0 ? analysis.difficulties : "",
          "Already Learned":    idx === 0 ? analysis.learned : "",
        });
      });

      // If student had no messages yet
      if (pairs.length === 0) {
        rows.push({
          "Student Name":       s.student.name,
          "Section":            s.student.section,
          "Date":               date,
          "Student Message":    "—",
          "Assistant Feedback": "—",
          "Main Difficulties":  "—",
          "Already Learned":    "—",
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [20, 14, 14, 60, 60, 40, 40].map(w => ({ wch: w }));

    // Style header row
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cell]) ws[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: "1a2744" } } };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Report");
    XLSX.writeFile(wb, `essay_report_${new Date().toISOString().slice(0,10)}.xlsx`);
    setExporting(false);
  };

  const fmtDate = ts => ts ? new Date(ts).toLocaleDateString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
  const msgCount = s => s.messages.filter(m => m.role === "user").length;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", maxWidth: 900, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: navy, fontFamily: "Georgia,serif" }}>👩‍🏫 Teacher Dashboard</div>
          <div style={{ fontSize: "0.8rem", color: "#7a8aaa", fontFamily: "sans-serif", marginTop: 2 }}>{sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={downloadExcel} disabled={!sessions.length || exporting} style={{
            background: sessions.length && !exporting ? `linear-gradient(135deg,${navy},${navyMid})` : "#e8ecf8",
            color: sessions.length && !exporting ? "white" : "#aab", border: "none", borderRadius: 10,
            padding: "9px 18px", fontSize: "0.85rem", fontFamily: "sans-serif", fontWeight: 600,
            cursor: sessions.length && !exporting ? "pointer" : "not-allowed",
          }}>{exporting ? "⏳ Analyzing sessions…" : "📥 Download Excel"}</button>
          <button onClick={onBack} style={{ background: "white", border: "1px solid #d0d8f0", borderRadius: 10, padding: "9px 16px", fontSize: "0.85rem", fontFamily: "sans-serif", color: "#5a6a8a", cursor: "pointer" }}>← Back</button>
        </div>
      </div>

      {sessions.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total sessions",  value: sessions.length, icon: "📋" },
            { label: "Unique students", value: new Set(sessions.map(s => s.student.name)).size, icon: "👤" },
            { label: "Total messages",  value: sessions.reduce((a, s) => a + msgCount(s), 0), icon: "💬" },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ background: "white", border: "1px solid #e8ecf8", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "bold", color: navy, fontFamily: "Georgia,serif" }}>{value}</div>
              <div style={{ fontSize: "0.78rem", color: "#7a8aaa", fontFamily: "sans-serif", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {loadingData && <div style={{ textAlign: "center", padding: 60, color: "#7a8aaa", fontFamily: "sans-serif" }}>Loading sessions…</div>}
      {!loadingData && !sessions.length && (
        <div style={{ textAlign: "center", padding: 60, color: "#7a8aaa", fontFamily: "sans-serif" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          No student sessions yet.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sessions.map((s, i) => (
          <div key={i} style={{ background: "white", border: `1px solid ${selected === i ? blue : "#e8ecf8"}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div onClick={() => setSelected(selected === i ? null : i)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, background: `linear-gradient(135deg,${blue},${lightBlue})`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontFamily: "sans-serif", fontSize: "0.9rem", flexShrink: 0 }}>
                  {s.student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: "bold", color: navy, fontFamily: "Georgia,serif", fontSize: "0.95rem" }}>{s.student.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#7a8aaa", fontFamily: "sans-serif", marginTop: 2 }}>
                    {s.student.section} · {s.student.email || "no email"} · {msgCount(s)} message{msgCount(s) !== 1 ? "s" : ""} · Last: {fmtDate(s.lastTime)}
                  </div>
                </div>
              </div>
              <div style={{ color: "#7a8aaa" }}>{selected === i ? "▲" : "▼"}</div>
            </div>
            {selected === i && (
              <div style={{ borderTop: "1px solid #e8ecf8", padding: "16px 20px", background: "#fafbff", display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                {s.messages.map((m, j) => (
                  <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 3 }}>
                    <div style={{ fontSize: "0.7rem", color: "#aab", fontFamily: "sans-serif" }}>
                      {m.role === "user" ? s.student.name : "Assistant"} · {fmtDate(m.ts)}
                    </div>
                    <div style={{
                      maxWidth: "82%", padding: "10px 14px",
                      borderRadius: m.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                      background: m.role === "user" ? `linear-gradient(135deg,${navy},${navyMid})` : "white",
                      color: m.role === "user" ? "white" : navy,
                      fontSize: "0.85rem", lineHeight: 1.6,
                      border: m.role === "assistant" ? "1px solid #e8ecf8" : "none",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                      {formatMsg(m.content)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView]           = useState("login");
  const [student, setStudent]     = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const handleStart = info => {
    setStudent(info);
    setSessionId(`${info.name.replace(/\s+/g,"_")}_${Date.now()}`);
    setView("chat");
  };

  return (
    <div style={{ minHeight: "100vh", background: bgGrad, display: "flex", flexDirection: "column", fontFamily: "Georgia,serif" }}>
      <Header student={view === "chat" ? student : null} onTeacher={() => setView("teacherLogin")} />
      {view === "login"        && <StudentLogin onStart={handleStart} />}
      {view === "chat"         && <Chat student={student} sessionId={sessionId} />}
      {view === "teacherLogin" && <TeacherLogin onLogin={() => setView("teacher")} onBack={() => setView(student ? "chat" : "login")} />}
      {view === "teacher"      && <TeacherDashboard onBack={() => setView(student ? "chat" : "login")} />}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
