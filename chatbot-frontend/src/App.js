// App.js
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const BG = "#2a5da8";
const BOT = "#fffbe6";
const USER = "#e3e8ff";
const ACCENT = "#e7b900";
const SCARF = "#b0b3b8";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const bubbles = document.querySelectorAll('.bubble');
    if (bubbles.length) {
      const last = bubbles[bubbles.length - 1];
      last.classList.add('fade-in');
    }
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5050/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      if (!res.ok) {
        throw new Error('Server error: ' + res.status);
      }
      const data = await res.json();
      if (data.image) {
        setMessages((msgs) => [...msgs, { sender: 'bot', image: data.image }]);
      } else {
        setMessages((msgs) => [...msgs, { sender: 'bot', text: data.reply }]);
      }
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Error: ' + err.message }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      display: "flex",
      flexDirection: "column",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <header style={{
        padding: "32px 0 16px 0",
        textAlign: "center",
        fontWeight: 700,
        fontSize: 32,
        letterSpacing: "-1px",
        color: ACCENT,
        background: BG,
        borderBottom: "1px solid #ececec",
        position: "relative"
      }}>
        <div>
          <span style={{
            fontWeight: 900,
            letterSpacing: "-2px",
            color: "#fff",
            textShadow: "0 2px 8px #1a1a1a"
          }}>Vogel</span>
          <span style={{
            color: ACCENT,
            textShadow: "0 2px 8px #1a1a1a"
          }}>GPT</span>
        </div>
        {/* Sash animation */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "60px",
          transform: "translateX(-50%) rotate(-15deg)",
          width: "180px",
          height: "16px",
          background: `linear-gradient(90deg, #e74c3c 33%, #fff 33%, #fff 66%, #3498db 66%)`,
          borderRadius: "8px",
          boxShadow: "0 2px 8px #1a1a1a55",
          zIndex: 1,
          animation: "sash-slide 2s cubic-bezier(.68,-0.55,.27,1.55) 1"
        }} />
        {/* Dollar sign eyes */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "18px",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px"
        }}>
          <span style={{
            fontSize: "22px",
            color: ACCENT,
            fontWeight: 900,
            filter: "drop-shadow(0 1px 2px #1a1a1a55)"
          }}>$</span>
          <span style={{
            fontSize: "22px",
            color: ACCENT,
            fontWeight: 900,
            filter: "drop-shadow(0 1px 2px #1a1a1a55)"
          }}>$</span>
        </div>
      </header>
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        width: "100%",
        padding: "24px 0 0 0"
      }}>
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 0 16px 0",
          minHeight: 300
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.sender === 'user' ? "flex-end" : "flex-start",
                margin: "8px 0"
              }}
            >
              <div
                className="bubble"
                style={{
                  background: msg.sender === 'user' ? USER : BOT,
                  color: "#222",
                  padding: "12px 18px",
                  borderRadius: 18,
                  maxWidth: "80%",
                  fontSize: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  border: msg.sender === 'user'
                    ? `2px solid #3498db`
                    : `2px solid ${ACCENT}`,
                  position: "relative",
                  animation: "fade-in 0.7s"
                }}
              >
                {/* If this is an image message, show the image */}
                {msg.image ? (
                  <img
                    src={msg.image}
                    alt="Generated by VogelGPT"
                    style={{
                      maxWidth: "100%",
                      borderRadius: 12,
                      display: "block",
                      margin: "0 auto"
                    }}
                  />
                ) : msg.sender === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
                {/* Scarf accent for bot */}
                {msg.sender === 'bot' && !msg.image && (
                  <span style={{
                    position: "absolute",
                    left: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 8,
                    height: 32,
                    background: SCARF,
                    borderRadius: 4,
                    opacity: 0.5
                  }} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{
              display: "flex",
              justifyContent: "flex-start",
              margin: "8px 0"
            }}>
              <div style={{
                background: BOT,
                color: ACCENT,
                padding: "12px 18px",
                borderRadius: 18,
                fontSize: 16,
                fontStyle: "italic",
                maxWidth: "80%",
                border: `2px solid ${ACCENT}`,
                animation: "pulse 1.2s infinite"
              }}>
                VogelGPT is typing…
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form
          onSubmit={sendMessage}
          style={{
            display: "flex",
            gap: 8,
            padding: "0 0 32px 0",
            background: BG
          }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: 16,
              border: "1.5px solid #e0e0e0",
              fontSize: 16,
              outline: "none",
              background: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
              transition: "border 0.2s",
            }}
            placeholder="Type your message…"
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              background: ACCENT,
              color: "#222",
              border: "none",
              borderRadius: 16,
              padding: "0 24px",
              fontWeight: 700,
              fontSize: 16,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.6 : 1,
              boxShadow: "0 2px 8px #1a1a1a22",
              transition: "opacity 0.2s, box-shadow 0.2s",
              animation: loading ? "send-bounce 1s infinite" : "none"
            }}
          >
            Send
          </button>
        </form>
      </main>
      <footer style={{
        textAlign: "center",
        color: "#fff",
        fontSize: 13,
        padding: "0 0 16px 0",
        background: BG,
        letterSpacing: "1px"
      }}>
        <span style={{ color: ACCENT, fontWeight: 700 }}>© {new Date().getFullYear()} VogelGPT</span>
      </footer>
      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .bubble.fade-in {
          animation: fade-in 0.7s;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 ${ACCENT}44; }
          70% { box-shadow: 0 0 0 8px ${ACCENT}11; }
          100% { box-shadow: 0 0 0 0 ${ACCENT}44; }
        }
        @keyframes send-bounce {
          0%, 100% { transform: scale(1);}
          50% { transform: scale(1.08);}
        }
        @keyframes sash-slide {
          0% { transform: translateX(-50%) rotate(-40deg);}
          100% { transform: translateX(-50%) rotate(-15deg);}
        }
      `}</style>
    </div>
  );
}

export default App;
