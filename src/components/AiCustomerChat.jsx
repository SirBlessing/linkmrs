import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/client.js';

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
        {msg.content.split('\n').map((line, i) => (
          <p key={i} style={{ margin: '0 0 0.2rem' }}>{line}</p>
        ))}
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

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role:    'assistant',
        content: `Hi! 👋 I'm the AI assistant for ${shopName}. Ask me anything — what's available, prices, or what to get within your budget. I understand English and Pidgin!`,
      }]);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const history = [...messages];
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const { reply } = await api.aiCustomer({
        shopSlug,
        message: msg,
        history,
      });
      setMessages((p) => [...p, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((p) => [
        ...p,
        { role: 'assistant', content: 'Sorry, I\'m having trouble right now. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating chat bubble */}
      <button
        type="button"
        className={`ai-chat-bubble ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with AI assistant"
      >
        <span className="material-symbols-outlined">
          {open ? 'close' : 'smart_toy'}
        </span>
        {!open && (
          <span className="ai-chat-bubble__label">Ask AI</span>
        )}
      </button>

      {/* Chat panel */}
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
            <button
              type="button"
              className="icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="ai-cust-panel__thread">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {loading && (
              <div className="ai-cust-msg ai-cust-msg--bot">
                <div className="ai-cust-msg__avatar">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div className="ai-cust-msg__bubble ai-cust-msg__bubble--loading">
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                  <span className="ai-typing-dot" />
                </div>
              </div>
            )}
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
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}