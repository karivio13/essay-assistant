import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxSBm2vB8XauxnoJLjISv3YJ_mOQsiCWUz1hxNkBHqGGVDtcs9U_UOGFz99T4-R3LdG/exec";

const saveToSheets = async (student, userMessage, feedback) => {
  try {
    await fetch(SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: student.name,
        section: student.section,
        email: student.email,
        date: new Date().toLocaleDateString("es-CL"),
        studentMessage: userMessage,
        feedback,
      }),
    });
  } catch {}
};

const SYSTEM_PROMPT = `You are an academic writing assistant and English language assessor for a B2+ English class. Students have written an informative essay of 350-450 words based on a provided source text about school coexistence. Your role is to give detailed, honest, and constructive feedback — never write the essay for the student.

CEFR B2 DESCRIPTORS YOU MUST USE TO ASSESS:

TASK ACHIEVEMENT (B2 standard):
- The text is clear, detailed, and informative
- Main ideas are developed with supporting detail and examples from the source
- The essay is objective and avoids personal opinion
- Key concepts are defined accurately
- The source text is referenced or paraphrased (not copied)

COHERENCE AND COHESION (B2 standard):
- Ideas are logically organized: introduction, body paragraphs, conclusion
- A variety of cohesive devices are used accurately (furthermore, however, consequently, in addition, as a result, in contrast, for instance, therefore, on the other hand)
- Paragraphs are well-structured with clear topic sentences
- Pronouns, synonyms and lexical chains are used to avoid repetition

LEXICAL RESOURCE (B2 standard):
- Vocabulary is formal and academic throughout
- A good range of vocabulary related to the topic is used
- Informal words must be flagged: "kids" -> "students/children", "a lot" -> "a significant number", "stuff" -> "aspects/elements", "good" -> "beneficial/effective"
- Avoids repetition of the same words

GRAMMATICAL RANGE AND ACCURACY (B2 standard):
- Uses a variety of structures: simple, compound, and complex sentences
- Passive voice is used appropriately
- Relative clauses are used correctly (which, who, that, where)
- Generally accurate grammar with only occasional errors
- Correct use of articles, prepositions, subject-verb agreement, and verb tenses

HOW TO STRUCTURE YOUR FEEDBACK — always follow this exact format:

Always begin with this exact line: "The following feedback is based on the Common European Framework of Reference for Languages (CEFR), 2020 Companion Volume — the most updated version of the framework."

**CEFR LEVEL ASSESSMENT**
State clearly whether the essay meets B2, is above (B2+/C1) or below (B1/B1+), and justify with specific evidence from the text.
If the essay is below B2, raise a clear alert: "WARNING: This essay does not yet meet B2 standard." and explain precisely why.

**TASK ACHIEVEMENT**
Evaluate whether the essay is informative, objective, and based on the source text. Flag any opinions, missing definitions, or lack of supporting detail.

**COHERENCE AND COHESION**
Comment on structure, paragraph organization, and use of cohesive devices. Quote specific sentences from the student's text.

**LEXICAL RESOURCE**
Identify informal or repeated vocabulary. Quote the exact word or phrase and suggest a formal academic alternative.

**GRAMMATICAL RANGE AND ACCURACY**
Identify grammar errors with the exact quote, explain why it is wrong, and provide the corrected version.
Format: [student's sentence] -> [corrected version] — Reason: [brief explanation]

THREE STRENGTHS
Identify 3 specific things the student did well, with quotes from their text as evidence.

THREE AREAS FOR IMPROVEMENT
Give 3 concrete, actionable suggestions with specific examples.

SENTENCE REWRITE EXAMPLE
Pick one weak sentence from the essay. Show:
- Original: [quote]
- Improved: [rewritten version]
- Why it is better: [brief explanation]

COHESIVE DEVICE OR STRUCTURE SUGGESTION
Suggest one specific cohesive device or sentence structure the student is not using, with an example of how they could apply it.

WORKING ON THE WEAKEST AREA
Identify the student's single weakest area and give a specific, practical strategy to improve it.

IMPORTANT RULES:
- Always respond in English
- Always quote the student's exact words when giving feedback
- Be encouraging but completely honest
- If the student sends a handwritten image, first transcribe it fully, then apply the full feedback structure above
- Never write full paragraphs or essays for the student
- If the student asks a grammar question, answer clearly with examples, then invite them to apply it in their writing`;

const navy = "#1a2744";
const navyMid = "#2d3f6e";
const blue = "#4f7af8";
const lightBlue = "#7c9fff";
const bgGrad = "linear-gradient(135deg, #f8f9ff 0%, #eef1fb 100%)";

const quickStart = [
  "Check my introduction",
  "Check my paragraph",
  "Check my conclusion",
  "Check my complete essay",
];

const followUps = [
  "What is my English level?",
  "What practice can I do to improve?",
  "Can you explain my grammar mistakes?",
  "How can I improve my vocabulary?",
  "Can you give me an example of passive voice?",
];

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

function Header({ student }) {
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
        <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>Chatbot Assistant - IEL</div>
        <div style={{ fontSize: "0.78rem", opacity: 0.7, fontFamily: "sans-serif", marginTop: 2 }}>
          School Coexistence · B2-B2+ English
          {student && ` · ${student.name} (${student.section})`}
        </div>
      </div>
      <div style={{ marginLeft: "auto" }}>
        <div style={{ background: navyMid, borderRadius: 20, padding: "4px 12px", fontSize: "0.72rem", fontFamily: "sans-serif", color: "#a8c4ff" }}>~350 words</div>
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
    { label: "Full name",  value: name,    set: setName,    placeholder: "e.g. Maria Gonzalez",  type: "text" },
    { label: "Section",    value: section, set: setSection, placeholder: "e.g. 4 Medio A",       type: "text" },
    { label: "Email",      value: email,   set: setEmail,   placeholder: "e.g. maria@gmail.com", type: "email" },
  ];

  const start = () => valid && onStart({ name: name.trim(), section: section.trim(), email: email.trim() });

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
            <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
              onKeyDown={e => e.key === "Enter" && start()}
              style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #d0d8f0", borderRadius: 10, fontSize: "0.92rem", fontFamily: "Georgia,serif", color: navy, outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = blue}
              onBlur={e => e.target.style.borderColor = "#d0d8f0"}
            />
          </div>
        ))}
        <div style={{ fontSize: "0.75rem", color: "#7a8aaa", fontFamily: "sans-serif", marginBottom: 16 }}>
          Your email will be saved for your teacher's records.
        </div>
        <button onClick={start} disabled={!valid} style={{
          width: "100%", padding: 13,
          background: valid ? `linear-gradient(135deg,${navy},${navyMid})` : "#e8ecf8",
          color: valid ? "white" : "#aab", border: "none", borderRadius: 12,
          fontSize: "0.95rem", fontFamily: "sans-serif", fontWeight: 600,
          cursor: valid ? "pointer" : "not-allowed",
        }}>Start writing</button>
      </div>
    </div>
  );
}

function Chat({ student }) {
  const initMsg = {
    role: "assistant",
    content: `Hello, ${student.name}! I am your academic writing assistant.\n\nI am here to help you with your informative essay on **school coexistence**. You can:\n\n- **Paste your draft** and I will give you detailed CEFR-based feedback\n- **Upload a photo** of your handwritten paragraph\n- **Ask grammar questions** (passive voice, relative clauses, etc.)\n\nWhat would you like to work on today?`,
    ts: new Date().toISOString(),
  };

  const [messages, setMessages] = useState([initMsg]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [image, setImage]       = useState(null);
  const fileRef                 = useRef(null);
  const bottomRef               = useRef(null);

  const words    = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
  const target   = 350;
  const pct      = Math.min(words / target, 1);
  const barColor = words === 0 ? "#e8ecf8" : words < 250 ? "#f0a500" : words <= 450 ? "#2a9d6e" : "#e05252";
  const barLabel = words < 250 ? "Keep writing!" : words <= 450 ? "Great length!" : "A bit long — consider trimming";

  const lastIsAssistant = messages.length > 1 && messages[messages.length - 1].role === "assistant";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const processFile = (blob) => new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d").drawImage(img, 0, 0);
        canvas.toBlob((jpegBlob) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ base64: reader.result.split(",")[1], mediaType: "image/jpeg", preview: reader.result });
          reader.readAsDataURL(jpegBlob);
        }, "image/jpeg", 0.92);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    const isHEIC = file.type === "image/heic" || file.type === "image/heif"
      || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");

    if (isHEIC) {
      if (!window.heic2any) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js";
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      try {
        const jpegBlob = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
        setImage(await processFile(jpegBlob));
      } catch {
        const reader = new FileReader();
        reader.onload = () => setImage({ base64: reader.result.split(",")[1], mediaType: "image/jpeg", preview: reader.result });
        reader.readAsDataURL(file);
      }
    } else {
      setImage(await processFile(file));
    }
  };

  const send = async (text) => {
    const userText = text || input.trim();
    if ((!userText && !image) || loading) return;

    const displayContent = userText || "Handwritten paragraph (image)";
    const userMsg = { role: "user", content: displayContent, ts: new Date().toISOString(), image: image?.preview };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    const sentImage = image;
    setImage(null);
    setLoading(true);

    try {
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

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I could not generate a response.";
      await saveToSheets(student, displayContent, reply);
      setMessages([...newMsgs, { role: "assistant", content: reply, ts: new Date().toISOString() }]);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "Something went wrong. Please try again.", ts: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const SuggestBtn = ({ label }) => (
    <button onClick={() => send(label)} style={{
      background: "white", border: "1px solid #d0d8f0", borderRadius: 20,
      padding: "6px 14px", fontSize: "0.78rem", color: navy,
      cursor: "pointer", fontFamily: "sans-serif", transition: "all 0.15s",
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = blue}
      onMouseOut={e => e.currentTarget.style.borderColor = "#d0d8f0"}
    >{label}</button>
  );

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
              {msg.image && <img src={msg.image} alt="handwritten" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 8, display: "block" }} />}
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

        {/* Follow-up suggestions after assistant replies */}
        {lastIsAssistant && !loading && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 42 }}>
            {followUps.map((s, i) => <SuggestBtn key={i} label={s} />)}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick start — shown only before first user message */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 20px 12px", maxWidth: 780, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          <div style={{ fontSize: "0.75rem", color: "#7a8aaa", fontFamily: "sans-serif", marginBottom: 8, letterSpacing: "0.5px" }}>QUICK START</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {quickStart.map((s, i) => <SuggestBtn key={i} label={s} />)}
          </div>
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: "14px 20px 20px", maxWidth: 780, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>

        {/* Word count */}
        {words > 0 && (
          <div style={{ marginBottom: 10, background: "white", border: "1px solid #e8ecf8", borderRadius: 12, padding: "10px 14px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: "0.78rem", fontFamily: "sans-serif", color: barColor, fontWeight: 700 }}>{words} word{words !== 1 ? "s" : ""}</span>
              <span style={{ fontSize: "0.72rem", fontFamily: "sans-serif", color: "#aab" }}>Target: {target}–450 words</span>
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
            <button onClick={() => setImage(null)} style={{ position: "absolute", top: -8, right: -8, background: "#e05252", color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: "0.75rem", cursor: "pointer" }}>x</button>
          </div>
        )}

        <div style={{ display: "flex", background: "white", border: "1.5px solid #d0d8f0", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <input ref={fileRef} type="file" accept="image/*,.heic,.heif" onChange={handleImage} style={{ display: "none" }} />
          <button onClick={() => fileRef.current.click()} title="Upload handwritten paragraph" style={{ background: "transparent", border: "none", borderRight: "1px solid #e8ecf8", padding: "0 14px", cursor: "pointer", fontSize: "1.2rem", color: image ? blue : "#aab" }}>📷</button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type your question, paste your draft, or upload a photo"
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

export default function App() {
  const [view, setView]       = useState("login");
  const [student, setStudent] = useState(null);

  const handleStart = info => {
    setStudent(info);
    setView("chat");
  };

  return (
    <div style={{ minHeight: "100vh", background: bgGrad, display: "flex", flexDirection: "column", fontFamily: "Georgia,serif" }}>
      <Header student={view === "chat" ? student : null} />
      {view === "login" && <StudentLogin onStart={handleStart} />}
      {view === "chat"  && <Chat student={student} />}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}
