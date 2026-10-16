import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../api/client.js';

const QUICK_PROMPTS = [
  'Which product is making me the most money?',
  'Why did my sales drop recently?',
  'Which customers order the most?',
  'What should I focus on to grow my revenue?',
  'Should I remove any products from my shop?',
  'How is my shop performing overall?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`ai-message ${isUser ? 'ai-message--user' : 'ai-message--assistant'}`}>
      {!isUser && (
        <div className="ai-message__avatar">
          <span className="material-symbols-outlined">smart_toy</span>
        </div>
      )}
      <div className="ai-message__bubble">
        {msg.content.split('\n').map((line, i) => (
          <p key={i} style={{ margin: '0 0 0.25rem' }}>{line}</p>
        ))}
      </div>
    </div>
  );
}

export default function AiPage() {
  const { shop } = useAuth();

  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setError('');

    const userMsg  = { role: 'user', content: msg };
    const newMsgs  = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const { reply } = await api.aiCoach({
        message: msg,
        history: messages,
      });
      setMessages([...newMsgs, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
      setMessages(newMsgs.slice(0, -1));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
    inputRef.current?.focus();
  };

  return (
    <div className="page ai-page">
      <header className="page__header">
        <div>
          <h1 className="heading-lg">
            <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--c-secondary)' }}>
              smart_toy
            </span>
            AI Business Coach
          </h1>
          <p className="page__subtitle">
            Ask anything about your shop. The AI reads your real data — products, orders, revenue — and gives you specific answers.
          </p>
        </div>
        {messages.length > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearChat}>
            <span className="material-symbols-outlined">refresh</span>
            New chat
          </button>
        )}
      </header>

      {/* Data context cards */}
      <div className="ai-context-cards">
        <div className="ai-context-card">
          <span className="material-symbols-outlined">inventory_2</span>
          <span>Products, prices &amp; descriptions</span>
        </div>
        <div className="ai-context-card">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span>All orders &amp; statuses</span>
        </div>
        <div className="ai-context-card">
          <span className="material-symbols-outlined">bar_chart</span>
          <span>Sales &amp; revenue data</span>
        </div>
        <div className="ai-context-card">
          <span className="material-symbols-outlined">people</span>
          <span>Customer history</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="ai-chat">
        <div className="ai-chat__thread">
          {messages.length === 0 ? (
            <div className="ai-chat__empty">
              <span className="material-symbols-outlined ai-chat__empty-icon">smart_toy</span>
              <h2 className="heading-md">
                Hey {shop?.shopName?.split(' ')[0] || 'there'} 👋
              </h2>
              <p>
                I have access to all your shop data. Ask me anything about your
                business — sales, products, customers, strategy.
              </p>

              <div className="ai-quick-prompts">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="ai-quick-prompt"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <Message key={i} msg={msg} />
              ))}
              {loading && (
                <div className="ai-message ai-message--assistant">
                  <div className="ai-message__avatar">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <div className="ai-message__bubble ai-message__bubble--loading">
                    <span className="ai-typing-dot" />
                    <span className="ai-typing-dot" />
                    <span className="ai-typing-dot" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="banner banner--warning" style={{ margin: '0 var(--sp-4)' }}>
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <div className="ai-chat__input-row">
          <textarea
            ref={inputRef}
            className="ai-chat__input"
            placeholder="Ask anything about your business… (Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            type="button"
            className="ai-chat__send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}