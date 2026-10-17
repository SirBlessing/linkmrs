import React, { useState, useRef, useEffect } from 'react';

const BASE = import.meta.env.VITE_API_URL || 'https://linkmrs.onrender.com';

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`ai-cust-msg ${isUser ? 'ai-cust-msg--user' : 'ai-cust-msg--bot'}`}>
      {!isUser && (
        <div className="ai-cust-msg__avatar">
          <span className="material-symbols-outlined">smart_toy</span>
        </div>
      )}
      <div className="ai-cust-msg__bubble">
        {msg.content
          ? msg.content.split('\n').map((line, i) => <p key={i} style={{ margin: '0 0 0.2rem' }}>{line}</p>)
          : <span className="ai-typing-placeholder">▍</span>
        }
      </div>
    </div>
  );
}

export default function AiCustomerChat({ shopSlug, shopName }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role:    'assistant',
        content: `Hi! 👋 I'm the AI assistant for ${shopName}. Ask me anything — what's available, prices, what to get within your budget. I understand English and Pidgin!`,
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const prevMsgs = [...messages];
    setMessages([...prevMsgs, { role: 'user', content: msg }, { role: 'assistant', content: '' }]);
    setLoading(true);

    try {
      const response = await fetch(`${BASE}/api/ai/customer`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ shopSlug, message: msg, history: messages }),
      });

      if (!response.ok) throw new Error('Failed');

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text  = decoder.decode(value);
        const lines = text.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') break;
          try {
            const { chunk } = JSON.parse(data);
            if (chunk) {
              setMessages((p) => {
                const updated = [...p];
                updated[updated.length - 1] = {
                  role:    'assistant',
                  content: updated[updated.length - 1].content + chunk,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((p) => {
        const updated = [...p];
        updated[updated.length - 1] = {
          role:    'assistant',
          content: "Sorry, I'm having trouble right now. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); send(); }
  };

  return (
    <>
      <button
        type="button"
        className={`ai-chat-bubble ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with AI assistant"
      >
        <span className="material-symbols-outlined">{open ? 'close' : 'smart_toy'}</span>
        {!open && <span className="ai-chat-bubble__label">Ask AI</span>}
      </button>

      {open && (
        <div className="ai-cust-panel">
          <div className="ai-cust-panel__header">
            <div className="ai-cust-panel__header-info">
              <span className="material-symbols-outlined">smart_toy</span>
              <div>
                <p className="ai-cust-panel__title">AI Assistant</p>
                <p className="ai-cust-panel__sub">{shopName}</p>
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="ai-cust-panel__thread">
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            <div ref={bottomRef} />
          </div>

          <div className="ai-cust-panel__input-row">
            <input
              ref={inputRef}
              type="text"
              className="ai-cust-panel__input"
              placeholder="Ask in English or Pidgin…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              type="button"
              className="ai-cust-panel__send"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              aria-label="Send"
            >
              {loading
                ? <span className="spinner" style={{ width: '0.875rem', height: '0.875rem', borderTopColor: '#fff', borderWidth: '2px' }} />
                : <span className="material-symbols-outlined">send</span>
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}